export interface NormalizedPoint {
  dayIndex: number;
  date: string; // ISO YYYY-MM-DD for XAxis
  displayDate?: string;
  normalizedValue: number; // 100 at Peak
  actualClose: number;
  phase?: 'decline' | 'recovery';
}

export interface HistoricalEpisode {
  id: string;
  name: string;
  shortLabel: string;
  peakDate: string; // Formatted display e.g. "18 Oct 2021"
  peakDateIso: string; // ISO YYYY-MM-DD
  peakValue: number;
  troughDate: string; // Formatted display e.g. "17 Jun 2022"
  troughDateIso: string; // ISO YYYY-MM-DD
  troughValue: number;
  drawdownPercent: number; // e.g. -17.2
  recoveryDate: string; // Formatted display e.g. "24 Nov 2022"
  recoveryDateIso: string; // ISO YYYY-MM-DD
  recoveryDays: number;
  recoveryMonths: number;
  recovered: boolean;
  normalizedPoints: NormalizedPoint[];
  contextNote: string;
}

export interface CurrentMarketMovement {
  benchmark: string;
  currentLevel: number;
  currentDate: string;
  recentPeakLevel: number;
  recentPeakDate: string;
  drawdownPercent: number; // e.g. -14.15
  dataFreshness: string;
  lastDataDate: string;
  isDelayed: boolean;
}

export interface StructuredMarketEvidence {
  currentDrawdown: number;
  benchmark: string;
  currentLevel: number;
  recentPeakLevel: number;
  recentPeakDate: string;
  comparableEpisodes: Array<{
    name: string;
    drawdownPercent: number;
    recoveryMonths: number;
    recovered: boolean;
  }>;
  sipAmount: number;
  primaryGoal: string;
  targetDate: string;
  pauseDuration: number;
}

export interface AIExplanationResult {
  explanation: string;
  model: string;
  source: 'groq_llm' | 'deterministic_fallback';
  generatedAt: string;
}
