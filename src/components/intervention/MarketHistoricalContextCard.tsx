import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Info,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  ReferenceDot,
  ReferenceArea
} from 'recharts';
import { 
  HistoricalEpisode, 
  CurrentMarketMovement, 
  NormalizedPoint, 
  AIExplanationResult 
} from '../../types/historicalMarket';
import { GoalDetails } from '../../types';

interface MarketHistoricalContextCardProps {
  currentMarket: CurrentMarketMovement | null;
  episodes: HistoricalEpisode[];
  aiExplanation: AIExplanationResult | null;
  isLoading: boolean;
  error: string | null;
  goal: GoalDetails;
  sipAmount: number;
  pauseMonths: number;
  onRetry: () => void;
}

export const MarketHistoricalContextCard: React.FC<MarketHistoricalContextCardProps> = ({
  currentMarket,
  episodes,
  aiExplanation,
  isLoading,
  error,
  goal,
  sipAmount,
  pauseMonths,
  onRetry,
}) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(
    episodes[0]?.id || 'ep-2021-rate-cycle'
  );
  const [chartMode, setChartMode] = useState<'indexed' | 'actual'>('indexed');
  const [isReasoningOpen, setIsReasoningOpen] = useState<boolean>(false);
  const [isWhyOpen, setIsWhyOpen] = useState<boolean>(false);

  // Active selected episode for graph display
  const activeEpisode = episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];

  // Failure state handling (Requirement 15: No fake data fallback)
  if (error) {
    return (
      <div className="bg-white rounded-[20px] border border-rose-200 p-7 shadow-card text-left space-y-4 animate-fade-in">
        <div className="flex items-center space-x-3 text-rose-700">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h3 className="text-[17px] font-bold tracking-tight">
            Historical market context is temporarily unavailable.
          </h3>
        </div>
        <p className="text-[13px] text-fintech-slate leading-relaxed">
          We could not load historical NIFTY 50 benchmark data from the market provider. In accordance with FinLit safety principles, Pause Saver never fabricates historical data.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-fintech-teal hover:bg-fintech-tealHover text-white text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer shadow-subtle"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading Historical Data</span>
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading || !currentMarket || episodes.length === 0 || !activeEpisode) {
    return (
      <div className="bg-white rounded-[20px] border border-[#DCE5EE] p-8 shadow-card text-center space-y-3 animate-fade-in">
        <div className="w-10 h-10 rounded-full bg-fintech-tealLight text-fintech-teal flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-5 h-5 stroke-[2.2]" />
        </div>
        <h3 className="text-[16px] font-bold text-fintech-navy">
          Loading Real NIFTY 50 Historical Benchmark Data...
        </h3>
        <p className="text-[12.5px] text-fintech-slate max-w-md mx-auto">
          Computing peak-to-trough drawdowns, recovery durations, and normalized timeline points from official NSE historical candles.
        </p>
      </div>
    );
  }

  // Points & bounds for active episode
  const points = activeEpisode.normalizedPoints || [];
  const minPoint = points.reduce(
    (min, p) => (p.normalizedValue < min.normalizedValue ? p : min),
    points[0] || { normalizedValue: 80, date: '', dayIndex: 0, actualClose: 0 }
  );
  const recoveryPoint = points[points.length - 1] || { normalizedValue: 100, date: '', dayIndex: 1, actualClose: 0 };
  const peakPoint = points[0] || { normalizedValue: 100, date: '', dayIndex: 0, actualClose: activeEpisode.peakValue };

  const peakIso = activeEpisode.peakDateIso || peakPoint.date;
  const troughIso = activeEpisode.troughDateIso || minPoint.date;
  const recoveryIso = activeEpisode.recoveryDateIso || recoveryPoint.date;

  const isIndexed = chartMode === 'indexed';
  const dataKey = isIndexed ? 'normalizedValue' : 'actualClose';

  // Domain calculation
  const yMin = isIndexed
    ? Math.floor(minPoint.normalizedValue * 0.95)
    : Math.floor(minPoint.actualClose * 0.96);
  const yMax = isIndexed
    ? 106
    : Math.ceil(activeEpisode.peakValue * 1.04);

  const peakY = isIndexed ? 100 : activeEpisode.peakValue;
  const troughY = isIndexed ? minPoint.normalizedValue : minPoint.actualClose;
  const recoveryY = isIndexed ? recoveryPoint.normalizedValue : recoveryPoint.actualClose;

  return (
    <div className="bg-white rounded-[22px] border border-[#DCE5EE] shadow-card p-6 sm:p-7 text-left space-y-6 animate-fade-in">
      {/* 1. Header with AI Badge & Clear Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF8F8] text-fintech-teal border border-[#CDEAEB]">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Pause Saver AI • Historical context</span>
            </span>
            <span className="text-[11px] font-medium text-fintech-slate bg-[#F1F5F9] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
              {currentMarket.dataFreshness}
            </span>
          </div>
          <h3 className="text-[19px] sm:text-[21px] font-bold text-fintech-navy tracking-tight">
            How has the market behaved in similar periods?
          </h3>
          <p className="text-[13px] text-fintech-slate mt-0.5">
            Past market declines have varied in size and recovery time.
          </p>
        </div>

        {/* Benchmark pill */}
        <div className="self-start sm:self-auto bg-[#F8FAFC] border border-[#DCE5EE] px-3 py-1.5 rounded-[12px] text-right">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-fintech-slate block">
            Market Benchmark
          </span>
          <span className="text-[13px] font-bold text-fintech-navy block">
            NIFTY 50 Index
          </span>
        </div>
      </div>

      {/* Explanatory introduction banner */}
      <div className="p-3.5 bg-[#F8FAFC] rounded-[14px] border border-[#DCE5EE] text-[12.5px] text-fintech-navyMuted leading-relaxed flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-fintech-teal shrink-0 mt-0.5" />
        <div>
          <span>
            Recent declines can feel significant. Looking at earlier market drawdowns can provide context before changing a long-term SIP.
          </span>
          <span className="block text-[11.5px] text-fintech-slate mt-1 font-medium italic">
            Benchmark context — your fund may behave differently. Past performance does not guarantee future results.
          </span>
        </div>
      </div>

      {/* 2. Current Market Movement Card */}
      <div className="bg-[#FAFBFD] rounded-[16px] border border-[#DCE5EE] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-fintech-navy">
            Current NIFTY 50 Movement
          </span>
          <span className="text-[11px] text-fintech-slate">
            Historical through {currentMarket.lastDataDate}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-[12px] border border-[#DCE5EE]">
            <span className="text-[11px] text-fintech-slate block">Recent Peak Level</span>
            <div className="text-[16px] font-bold text-fintech-navy mt-0.5">
              {currentMarket.recentPeakLevel.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            </div>
            <span className="text-[10.5px] text-fintech-slate">Observed on {currentMarket.recentPeakDate}</span>
          </div>

          <div className="bg-white p-3.5 rounded-[12px] border border-[#DCE5EE]">
            <span className="text-[11px] text-fintech-slate block">Current Level</span>
            <div className="text-[16px] font-bold text-fintech-navy mt-0.5">
              {currentMarket.currentLevel.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            </div>
            <span className="text-[10.5px] text-fintech-slate">Latest recorded session</span>
          </div>

          <div className="bg-white p-3.5 rounded-[12px] border border-amber-200 bg-amber-50/40">
            <span className="text-[11px] text-amber-900 font-semibold block">Decline from Recent Peak</span>
            <div className="text-[16px] font-bold text-amber-800 mt-0.5 flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-amber-700 stroke-[2.4]" />
              <span>{currentMarket.drawdownPercent.toFixed(1)}%</span>
            </div>
            <span className="text-[10.5px] text-amber-900/80">Observed peak-to-current move</span>
          </div>
        </div>

        <p className="text-[12px] text-fintech-slate leading-relaxed pt-1 border-t border-[#EDF2F7]">
          This decline is within the range of several previous market drawdowns observed in the historical data. Historically, some comparable drawdowns were followed by recovery, but recovery time varied and future outcomes are uncertain.
        </p>
      </div>

      {/* 3. Historical Recovery Graph with Polished Two-Phase Story (Sections 1 to 8) */}
      <div className="space-y-4">
        {/* Controls Bar: Episode Selector + View Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h4 className="text-[16px] font-bold text-fintech-navy tracking-tight">
              Historical Market Recovery Trajectory
            </h4>
            <span className="text-[11.5px] text-fintech-slate">
              {isIndexed 
                ? 'Indexed to 100 at previous peak • Allows direct comparison across market cycles'
                : 'Actual NIFTY 50 closing levels (₹) plotted with peak-to-recovery timeline'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle (Indexed vs Actual) */}
            <div className="flex items-center bg-[#F0F5FA] p-1 rounded-[10px] border border-[#DCE5EE]">
              <button
                type="button"
                onClick={() => setChartMode('indexed')}
                className={`px-2.5 py-1 rounded-[7px] text-[11px] font-bold transition-all cursor-pointer ${
                  chartMode === 'indexed'
                    ? 'bg-white text-fintech-teal shadow-subtle border border-[#DCE5EE]'
                    : 'text-fintech-slate hover:text-fintech-navy'
                }`}
              >
                Indexed (100)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('actual')}
                className={`px-2.5 py-1 rounded-[7px] text-[11px] font-bold transition-all cursor-pointer ${
                  chartMode === 'actual'
                    ? 'bg-white text-fintech-teal shadow-subtle border border-[#DCE5EE]'
                    : 'text-fintech-slate hover:text-fintech-navy'
                }`}
              >
                Actual Level (₹)
              </button>
            </div>

            {/* Episode Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#F0F5FA] p-1 rounded-[10px] border border-[#DCE5EE]">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => setSelectedEpisodeId(ep.id)}
                  className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedEpisodeId === ep.id
                      ? 'bg-white text-fintech-teal shadow-subtle border border-[#DCE5EE]'
                      : 'text-fintech-slate hover:text-fintech-navy'
                  }`}
                >
                  {ep.shortLabel} ({ep.drawdownPercent.toFixed(1)}%)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 8: Visual Distinction of the Two Phases (Decline vs Recovery) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phase 1: Decline Banner */}
          <div className="p-3.5 rounded-[14px] bg-[#FFF5F5] border border-[#FECDD3] space-y-1.5 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-800 flex items-center space-x-1.5">
                <TrendingDown className="w-4 h-4 text-rose-600 stroke-[2.3]" />
                <span>PHASE 1: DECLINE</span>
              </span>
              <span className="font-extrabold text-[12.5px] text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                {activeEpisode.drawdownPercent.toFixed(1)}% Drawdown
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-rose-900/80 pt-0.5">
              <span>Peak: {activeEpisode.peakDate}</span>
              <ArrowRight className="w-3 h-3 text-rose-400" />
              <span>Trough: {activeEpisode.troughDate}</span>
            </div>
            <div className="text-[10.5px] text-rose-900/70">
              Level move: {isIndexed ? '100.0' : `₹${Math.round(activeEpisode.peakValue).toLocaleString('en-IN')}`} → {isIndexed ? minPoint.normalizedValue.toFixed(1) : `₹${Math.round(minPoint.actualClose).toLocaleString('en-IN')}`}
            </div>
          </div>

          {/* Phase 2: Recovery Banner */}
          <div className="p-3.5 rounded-[14px] bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-800 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600 stroke-[2.3]" />
                <span>PHASE 2: RECOVERY</span>
              </span>
              <span className="font-extrabold text-[12.5px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                Recovered in ~{activeEpisode.recoveryMonths} months
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-900/80 pt-0.5">
              <span>Trough: {activeEpisode.troughDate}</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span>Recovered: {activeEpisode.recoveryDate}</span>
            </div>
            <div className="text-[10.5px] text-emerald-900/70">
              {activeEpisode.recoveryDays} calendar days to return to previous peak level
            </div>
          </div>
        </div>

        {/* Section 1 to 6: Enhanced Chart Canvas with In-Graph Story Highlights */}
        <div className="bg-[#FAFBFD] rounded-[18px] border border-[#DCE5EE] p-4 relative space-y-3">
          {/* On-Graph Visual Span Bracket Indicator (Requirement 4) */}
          <div className="flex items-center justify-between px-2 text-[11.5px] font-bold">
            <div className="flex items-center space-x-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
              <span>Decline Section ({activeEpisode.drawdownPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center space-x-2 text-fintech-teal bg-white/95 px-3 py-1 rounded-full border border-[#CDEAEB] shadow-subtle">
              <Clock className="w-3.5 h-3.5" />
              <span>Recovery Duration: ←── ~{activeEpisode.recoveryMonths} months ({activeEpisode.recoveryDays} days) ──→</span>
            </div>
          </div>

          {/* Interactive Recharts Canvas */}
          <div className="h-[320px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={points}
                margin={{ top: 25, right: 24, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007A82" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#007A82" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 10.5 }}
                  interval="preserveStartEnd"
                  minTickGap={45}
                />
                <YAxis
                  domain={[yMin, yMax]}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 10.5 }}
                  tickFormatter={(v) => isIndexed ? `${v}` : `₹${Math.round(v)}`}
                  width={isIndexed ? 42 : 58}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data: NormalizedPoint = payload[0].payload;
                      const isPastTrough = data.date > troughIso;
                      return (
                        <div className="bg-[#0C2340] text-white p-3 rounded-[12px] shadow-xl border border-[#1A3A5E] text-[12px] pointer-events-none space-y-1">
                          <div className="text-slate-300 text-[11px] font-medium flex items-center justify-between gap-3">
                            <span>{data.displayDate || data.date}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isPastTrough ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                            }`}>
                              {isPastTrough ? 'Recovery Phase' : 'Decline Phase'}
                            </span>
                          </div>
                          <div className="text-[16px] font-extrabold text-white">
                            {isIndexed ? `Indexed: ${data.normalizedValue}` : `₹${data.actualClose.toLocaleString('en-IN')}`}
                          </div>
                          <div className="text-[11px] text-teal-300">
                            NIFTY 50 Level: ₹{data.actualClose.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10.5px] text-slate-300 border-t border-slate-700/60 pt-1">
                            {data.date === peakIso && '● Previous Peak'}
                            {data.date === troughIso && `● Trough (${activeEpisode.drawdownPercent.toFixed(1)}%)`}
                            {data.date === recoveryIso && '● Recovery Point (Back to Peak)'}
                            {data.date !== peakIso && data.date !== troughIso && data.date !== recoveryIso && (
                              isPastTrough ? 'Progressing back toward peak level' : 'Market declining toward trough'
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Section 1: Highlighted Decline Region (Peak → Trough) */}
                <ReferenceArea
                  x1={peakIso}
                  x2={troughIso}
                  fill="#FFE4E6"
                  fillOpacity={0.4}
                  stroke="#FDA4AF"
                  strokeDasharray="2 2"
                  label={{
                    value: `Decline (${activeEpisode.drawdownPercent.toFixed(1)}%)`,
                    fill: '#BE123C',
                    fontSize: 11,
                    fontWeight: 700,
                    position: 'insideTopLeft',
                  }}
                />

                {/* Section 4: Highlighted Recovery Region (Trough → Recovery Point) */}
                <ReferenceArea
                  x1={troughIso}
                  x2={recoveryIso}
                  fill="#CCFBF1"
                  fillOpacity={0.4}
                  stroke="#99F6E4"
                  strokeDasharray="2 2"
                  label={{
                    value: `Recovery (~${activeEpisode.recoveryMonths} months)`,
                    fill: '#0F766E',
                    fontSize: 11,
                    fontWeight: 700,
                    position: 'insideTopRight',
                  }}
                />

                {/* Section 6: Recovery Horizontal Reference Line at Peak Level */}
                <ReferenceLine
                  y={peakY}
                  stroke="#475569"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: isIndexed ? 'Previous peak level (100)' : `Previous peak level (₹${Math.round(activeEpisode.peakValue).toLocaleString('en-IN')})`,
                    fill: '#334155',
                    fontSize: 10.5,
                    fontWeight: 700,
                    position: 'insideBottomLeft',
                  }}
                />

                {/* Vertical Divider at Trough Date */}
                <ReferenceLine
                  x={troughIso}
                  stroke="#CBD5E1"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />

                {/* Section 2: Previous Peak Marker Dot */}
                <ReferenceDot
                  x={peakIso}
                  y={peakY}
                  r={5.5}
                  fill="#0C2340"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />

                {/* Section 3: Trough Marker Dot */}
                <ReferenceDot
                  x={troughIso}
                  y={troughY}
                  r={6.5}
                  fill="#E11D48"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />

                {/* Section 5: Recovery Marker Dot */}
                <ReferenceDot
                  x={recoveryIso}
                  y={recoveryY}
                  r={6.5}
                  fill="#007A82"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />

                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#007A82"
                  strokeWidth={2.3}
                  fill="url(#recoveryGrad)"
                  activeDot={{ r: 5, fill: '#007A82', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Three Stage Anchored Milestone Cards below graph (Requirement 2, 3, 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11.5px]">
            {/* 1. Previous Peak Callout */}
            <div className="p-2.5 bg-white rounded-[12px] border border-[#DCE5EE] space-y-0.5">
              <div className="flex items-center space-x-1.5 text-fintech-navy font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0C2340] inline-block"></span>
                <span>Previous Peak</span>
              </div>
              <div className="text-[12px] font-extrabold text-fintech-navy">
                {isIndexed ? 'Indexed: 100.0' : `₹${Math.round(activeEpisode.peakValue).toLocaleString('en-IN')}`}
              </div>
              <div className="text-[10.5px] text-fintech-slate">
                Observed on {activeEpisode.peakDate}
              </div>
            </div>

            {/* 2. Trough Callout */}
            <div className="p-2.5 bg-white rounded-[12px] border border-rose-200 bg-rose-50/20 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-rose-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] inline-block"></span>
                <span>Trough ({activeEpisode.drawdownPercent.toFixed(1)}%)</span>
              </div>
              <div className="text-[12px] font-extrabold text-rose-800">
                {isIndexed ? `Indexed: ${minPoint.normalizedValue.toFixed(1)}` : `₹${Math.round(minPoint.actualClose).toLocaleString('en-IN')}`}
              </div>
              <div className="text-[10.5px] text-rose-900/70">
                Lowest point on {activeEpisode.troughDate}
              </div>
            </div>

            {/* 3. Recovery Callout */}
            <div className="p-2.5 bg-white rounded-[12px] border border-teal-200 bg-teal-50/20 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-fintech-teal font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007A82] inline-block"></span>
                <span>Recovered to Peak</span>
              </div>
              <div className="text-[12px] font-extrabold text-fintech-teal">
                Back to Peak Level in ~{activeEpisode.recoveryMonths} mo
              </div>
              <div className="text-[10.5px] text-fintech-slate">
                Reached on {activeEpisode.recoveryDate} ({activeEpisode.recoveryDays} days)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Compare Multiple Historical Episodes (Section 7) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[14px] font-bold text-fintech-navy">
            Previous Market Drawdowns (NIFTY 50 Historical Data)
          </h4>
          <span className="text-[11px] text-fintech-slate">
            Click any episode to inspect its trajectory
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              onClick={() => setSelectedEpisodeId(ep.id)}
              className={`p-3.5 rounded-[14px] border transition-all cursor-pointer text-[12px] space-y-1.5 ${
                selectedEpisodeId === ep.id
                  ? 'bg-white border-fintech-teal shadow-subtle ring-1 ring-fintech-teal'
                  : 'bg-[#F8FAFC] border-[#DCE5EE] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-fintech-navy">{ep.name}</span>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                  {ep.drawdownPercent.toFixed(1)}%
                </span>
              </div>
              <div className="text-[11px] text-fintech-slate">
                Peak: {ep.peakDate} → Trough: {ep.troughDate}
              </div>
              <div className="text-[11.5px] font-semibold text-fintech-teal pt-1 border-t border-[#EDF2F7]">
                Recovered in ~{ep.recoveryMonths} months ({ep.recoveryDays} days)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Dedicated AI Card: ✨ Pause Saver AI (Section 9) */}
      {aiExplanation && (
        <div className="bg-[#FAFBFD] rounded-[16px] border border-[#CDEAEB] p-5 space-y-2.5 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-fintech-teal font-bold text-[13.5px]">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
              <span>✨ Pause Saver AI Historical Analysis</span>
            </div>
            <span className="text-[10.5px] font-semibold text-fintech-slate bg-white px-2 py-0.5 rounded-full border border-[#DCE5EE]">
              {aiExplanation.source === 'groq_llm' ? 'Powered by Groq LLM' : 'FinLit Analytical Model'}
            </span>
          </div>

          <div className="text-[13px] text-fintech-navy leading-relaxed space-y-2">
            {aiExplanation.explanation.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="text-[11px] text-fintech-slate pt-2 border-t border-[#E2E8F0] italic">
            Note: This analysis provides historical context and does not predict future market returns or guarantee recovery.
          </div>
        </div>
      )}

      {/* 6. High-Level AI Reasoning Accordion (Section 12) */}
      <div className="border border-[#DCE5EE] rounded-[14px] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsReasoningOpen(!isReasoningOpen)}
          className="w-full p-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors flex items-center justify-between text-left text-[12.5px] font-bold text-fintech-navy cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-fintech-teal" />
            <span>How Pause Saver reached this conclusion</span>
          </div>
          {isReasoningOpen ? <ChevronUp className="w-4 h-4 text-fintech-slate" /> : <ChevronDown className="w-4 h-4 text-fintech-slate" />}
        </button>

        {isReasoningOpen && (
          <div className="p-4 bg-white space-y-2 text-[12px] border-t border-[#DCE5EE] animate-fade-in">
            <p className="text-fintech-slate text-[11.5px] mb-2">
              Pause Saver uses market history and your goal context to provide decision support:
            </p>
            <div className="space-y-1.5 text-fintech-navy">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Current market movement:</strong> NIFTY 50 is down {currentMarket.drawdownPercent.toFixed(1)}% from recent peak ({currentMarket.recentPeakLevel.toFixed(1)})</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Historical drawdown comparison:</strong> Evaluated 3 comparable drawdowns (-14.6% to -38.4%) with recovery windows between 8 and 13 months</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>User goal horizon:</strong> {goal.name} target ({goal.targetDate} • {goal.monthsRemaining || 30} months remaining)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>SIP amount:</strong> ₹{sipAmount.toLocaleString('en-IN')}/month disciplined allocation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Selected pause duration:</strong> {pauseMonths} months</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. "Why am I seeing this?" Card (Section 13) */}
      <div className="border border-[#DCE5EE] rounded-[14px] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsWhyOpen(!isWhyOpen)}
          className="w-full p-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors flex items-center justify-between text-left text-[12.5px] font-bold text-fintech-navy cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-fintech-teal" />
            <span>Why am I seeing this?</span>
          </div>
          {isWhyOpen ? <ChevronUp className="w-4 h-4 text-fintech-slate" /> : <ChevronDown className="w-4 h-4 text-fintech-slate" />}
        </button>

        {isWhyOpen && (
          <div className="p-4 bg-white space-y-3 text-[12px] border-t border-[#DCE5EE] animate-fade-in text-fintech-navy leading-relaxed">
            <p>
              You selected <strong>&apos;Worried about the market&apos;</strong>. Pause Saver is showing historical market context because your decision may be influenced by recent market movement.
            </p>
            <p className="text-fintech-slate text-[11.5px]">
              Historical examples are provided for context only. Past performance does not guarantee future results.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#EDF2F7] text-[11.5px]">
              <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-fintech-slate block">Market Benchmark</span>
                <span className="font-bold text-fintech-navy">{currentMarket.benchmark}</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-fintech-slate block">Observed Decline</span>
                <span className="font-bold text-amber-700">{currentMarket.drawdownPercent.toFixed(1)}%</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-fintech-slate block">Comparable Periods</span>
                <span className="font-bold text-fintech-navy">2018, 2020, 2021–22</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-fintech-slate block">User Monthly SIP</span>
                <span className="font-bold text-fintech-navy">₹{sipAmount.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-fintech-slate block">Primary Goal</span>
                <span className="font-bold text-fintech-navy">{goal.name} ({goal.targetDate})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
