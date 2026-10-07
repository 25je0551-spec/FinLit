import { 
  HistoricalEpisode, 
  CurrentMarketMovement, 
  NormalizedPoint, 
  AIExplanationResult 
} from '../types/historicalMarket';
import { GoalDetails } from '../types';

export interface HistoricalMarketAnalysisResult {
  currentMarket: CurrentMarketMovement;
  comparableEpisodes: HistoricalEpisode[];
  aiExplanation: AIExplanationResult;
  lastUpdatedDate: string;
}

function formatDateDisplay(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split('-');
    const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${mNames[mIdx] || m} ${y}`;
  } catch {
    return isoDate;
  }
}

// Clean and sample points for chart performance and clarity, ensuring Peak, Trough, and Recovery are exact
function buildNormalizedTimeline(
  rawPoints: Array<{ date: string; close: number; timestamp: number }>,
  peakValue: number,
  troughIso: string
): NormalizedPoint[] {
  if (rawPoints.length === 0) return [];

  // Find exact trough point in raw data
  const troughRaw = rawPoints.find((p) => p.date === troughIso) ||
    rawPoints.reduce((min, p) => p.close < min.close ? p : min, rawPoints[0]);

  // Sample to max ~35-40 points for ultra-clean rendering on desktop
  const step = Math.max(1, Math.floor(rawPoints.length / 35));
  const pointMap = new Map<string, { date: string; close: number }>();

  // 1. Always include first point (Peak)
  pointMap.set(rawPoints[0].date, rawPoints[0]);

  // 2. Sample intermediate points
  for (let i = 0; i < rawPoints.length; i += step) {
    pointMap.set(rawPoints[i].date, rawPoints[i]);
  }

  // 3. Always include exact Trough point
  pointMap.set(troughRaw.date, troughRaw);

  // 4. Always include exact Recovery point (last point)
  const lastRaw = rawPoints[rawPoints.length - 1];
  pointMap.set(lastRaw.date, lastRaw);

  // Sort by date chronologically
  const sorted = Array.from(pointMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return sorted.map((p, idx) => ({
    dayIndex: idx,
    date: p.date,
    displayDate: formatDateDisplay(p.date),
    normalizedValue: Number(((p.close / peakValue) * 100).toFixed(2)),
    actualClose: Number(p.close.toFixed(2)),
    phase: p.date <= troughIso ? 'decline' : 'recovery',
  }));
}

export async function getHistoricalMarketAnalysis(
  goal?: GoalDetails,
  sipAmount: number = 4000,
  pauseMonths: number = 6
): Promise<HistoricalMarketAnalysisResult> {
  // Fetch real 10-year daily NIFTY 50 data from our proxy
  const chartUrl = '/api/market/chart?symbol=%5ENSEI&range=10y&interval=1d';
  const response = await fetch(chartUrl);
  if (!response.ok) {
    throw new Error('Historical market context is temporarily unavailable. Could not fetch NIFTY 50 benchmark data.');
  }

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
    throw new Error('Historical market context is temporarily unavailable. Incomplete benchmark data returned.');
  }

  const timestamps: number[] = result.timestamp;
  const closes: Array<number | null> = result.indicators.quote[0].close;

  // Clean data array
  const points: Array<{ date: string; timestamp: number; close: number }> = [];
  for (let i = 0; i < timestamps.length; i++) {
    const val = closes[i];
    if (val != null && !isNaN(val)) {
      const dt = new Date(timestamps[i] * 1000);
      points.push({
        date: dt.toISOString().split('T')[0],
        timestamp: timestamps[i],
        close: Number(val.toFixed(2)),
      });
    }
  }

  if (points.length < 200) {
    throw new Error('Insufficient historical data points to compute benchmark drawdowns.');
  }

  // 1. Calculate Current Market Movement
  // Look back at the last 180 trading sessions to find the recent peak
  const recentWindow = points.slice(-180);
  let recentPeak = recentWindow[0];
  for (const p of recentWindow) {
    if (p.close > recentPeak.close) {
      recentPeak = p;
    }
  }

  const latestPoint = points[points.length - 1];
  const currentDrawdown = Number((((latestPoint.close - recentPeak.close) / recentPeak.close) * 100).toFixed(2));

  const currentMarket: CurrentMarketMovement = {
    benchmark: 'NIFTY 50',
    currentLevel: latestPoint.close,
    currentDate: latestPoint.date,
    recentPeakLevel: recentPeak.close,
    recentPeakDate: recentPeak.date,
    drawdownPercent: currentDrawdown,
    dataFreshness: 'NSE EOD • Historical Benchmark',
    lastDataDate: latestPoint.date,
    isDelayed: false,
  };

  // 2. Extract 3 Most Meaningful Historical Drawdown & Recovery Episodes from Real Data
  
  // Episode A: 2021–2022 Global Inflation & Rate Tightening Cycle
  // Peak: 2021-10-18 (18,477.05) -> Trough: 2022-06-17 (15,293.50) -> Recovered: 2022-11-24 (18,484.10)
  const pts2021 = points.filter((p) => p.date >= '2021-10-18' && p.date <= '2022-11-24');
  const ep2021Peak = pts2021[0]?.close || 18477.05;
  const ep2021TroughPt = pts2021.reduce((min, p) => p.close < min.close ? p : min, pts2021[0] || { close: 15293.5 });
  const ep2021DD = Number((((ep2021TroughPt.close - ep2021Peak) / ep2021Peak) * 100).toFixed(1));
  const ep2021Days = 402;
  const ep2021Months = 13;

  // Episode B: 2018 NBFC Liquidity & Mid-cap Correction
  // Peak: 2018-08-28 (11,738.50) -> Trough: 2018-10-26 (10,030.00) -> Recovered: 2019-04-16 (11,787.15)
  const pts2018 = points.filter((p) => p.date >= '2018-08-28' && p.date <= '2019-04-16');
  const ep2018Peak = pts2018[0]?.close || 11738.5;
  const ep2018TroughPt = pts2018.reduce((min, p) => p.close < min.close ? p : min, pts2018[0] || { close: 10030.0 });
  const ep2018DD = Number((((ep2018TroughPt.close - ep2018Peak) / ep2018Peak) * 100).toFixed(1));
  const ep2018Days = 231;
  const ep2018Months = 8;

  // Episode C: 2020 COVID-era Decline
  // Peak: 2020-01-14 (12,362.30) -> Trough: 2020-03-23 (7,610.25) -> Recovered: 2020-11-09 (12,461.05)
  const pts2020 = points.filter((p) => p.date >= '2020-01-14' && p.date <= '2020-11-09');
  const ep2020Peak = pts2020[0]?.close || 12362.3;
  const ep2020TroughPt = pts2020.reduce((min, p) => p.close < min.close ? p : min, pts2020[0] || { close: 7610.25 });
  const ep2020DD = Number((((ep2020TroughPt.close - ep2020Peak) / ep2020Peak) * 100).toFixed(1));
  const ep2020Days = 300;
  const ep2020Months = 10;

  const comparableEpisodes: HistoricalEpisode[] = [
    {
      id: 'ep-2021-rate-cycle',
      name: '2021–2022 Global Rate Cycle',
      shortLabel: '2021–22 Rate Cycle',
      peakDate: '18 Oct 2021',
      peakDateIso: '2021-10-18',
      peakValue: ep2021Peak,
      troughDate: '17 Jun 2022',
      troughDateIso: '2022-06-17',
      troughValue: ep2021TroughPt.close,
      drawdownPercent: ep2021DD, // -17.2%
      recoveryDate: '24 Nov 2022',
      recoveryDateIso: '2022-11-24',
      recoveryDays: ep2021Days,
      recoveryMonths: ep2021Months,
      recovered: true,
      normalizedPoints: buildNormalizedTimeline(pts2021, ep2021Peak, '2022-06-17'),
      contextNote: 'Driven by global monetary tightening and inflation concerns. Market consolidated for ~8 months before recovering.',
    },
    {
      id: 'ep-2018-liquidity',
      name: '2018 NBFC Liquidity Correction',
      shortLabel: '2018 Liquidity Shock',
      peakDate: '28 Aug 2018',
      peakDateIso: '2018-08-28',
      peakValue: ep2018Peak,
      troughDate: '26 Oct 2018',
      troughDateIso: '2018-10-26',
      troughValue: ep2018TroughPt.close,
      drawdownPercent: ep2018DD, // -14.6%
      recoveryDate: '16 Apr 2019',
      recoveryDateIso: '2019-04-16',
      recoveryDays: ep2018Days,
      recoveryMonths: ep2018Months,
      recovered: true,
      normalizedPoints: buildNormalizedTimeline(pts2018, ep2018Peak, '2018-10-26'),
      contextNote: 'Triggered by domestic credit and liquidity tightening. Sharper initial dip followed by steady multi-month normalization.',
    },
    {
      id: 'ep-2020-covid',
      name: '2020 COVID-era Decline',
      shortLabel: '2020 Pandemic Shock',
      peakDate: '14 Jan 2020',
      peakDateIso: '2020-01-14',
      peakValue: ep2020Peak,
      troughDate: '23 Mar 2020',
      troughDateIso: '2020-03-23',
      troughValue: ep2020TroughPt.close,
      drawdownPercent: ep2020DD, // -38.4%
      recoveryDate: '09 Nov 2020',
      recoveryDateIso: '2020-11-09',
      recoveryDays: ep2020Days,
      recoveryMonths: ep2020Months,
      recovered: true,
      normalizedPoints: buildNormalizedTimeline(pts2020, ep2020Peak, '2020-03-23'),
      contextNote: 'Severe global liquidity shock. Rapid drop of ~38% followed by strong policy stimulus and recovery within ~10 months.',
    },
  ];

  // 3. Request Groq AI Explanation (Server-side with deterministic fallback)
  let aiExplanation: AIExplanationResult = {
    explanation: `Markets have experienced declines of a similar magnitude before. In historical periods such as the 2018 (-14.6%) and 2021–2022 (-17.2%) drawdowns, the NIFTY 50 benchmark subsequently returned to its previous peak, with recovery times ranging from 8 to 13 months.

Past market performance provides historical perspective rather than a forecast of future outcomes. Pausing your ₹${sipAmount.toLocaleString('en-IN')}/month contribution for ${pauseMonths} months creates an estimated ₹${(pauseMonths * sipAmount).toLocaleString('en-IN')} contribution gap toward your ${goal?.name || 'primary goal'}, which may shift your ${goal?.targetDate || 'target'} milestone regardless of broader market fluctuations.`,
    model: 'finlit-deterministic-rules',
    source: 'deterministic_fallback',
    generatedAt: new Date().toISOString(),
  };

  try {
    const aiResp = await fetch('/api/pause-saver/market-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentDrawdown,
        benchmark: 'NIFTY 50',
        currentLevel: latestPoint.close,
        recentPeakLevel: recentPeak.close,
        recentPeakDate: recentPeak.date,
        comparableEpisodes: comparableEpisodes.map((e) => ({
          name: e.name,
          drawdownPercent: e.drawdownPercent,
          recoveryMonths: e.recoveryMonths,
          recovered: e.recovered,
        })),
        sipAmount,
        primaryGoal: goal?.name || 'Dream Bike',
        targetDate: goal?.targetDate || 'Mar 2029',
        pauseDuration: pauseMonths,
      }),
    });

    if (aiResp.ok) {
      const aiData = await aiResp.json();
      if (aiData.explanation) {
        aiExplanation = aiData;
      }
    }
  } catch (err) {
    console.warn('AI explanation request failed, using validated fallback:', err);
  }

  return {
    currentMarket,
    comparableEpisodes,
    aiExplanation,
    lastUpdatedDate: latestPoint.date,
  };
}
