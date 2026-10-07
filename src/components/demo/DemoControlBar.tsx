import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Wallet, 
  TrendingDown,
  Activity,
  Target,
  MoreHorizontal
} from 'lucide-react';
import type { IntentId } from '../../types';

interface DemoControlBarProps {
  onLoadIntent: (intent: IntentId) => void;
  onReset: () => void;
  activeIntent?: IntentId;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  onLoadIntent,
  onReset,
  activeIntent,
}) => {
  return (
    <div className="bg-[#0C2340] text-white px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-[12px] border-b border-[#1A3A5E] z-40 sticky top-0 select-none">
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-1.5 bg-fintech-teal px-2 py-0.5 rounded-[6px] font-bold text-[10.5px]">
          <Sparkles className="w-3 h-3" />
          <span>TRUE INTENT-AWARE DEMOS</span>
        </div>
        <span className="text-slate-300 hidden xl:inline-block text-[11.5px]">
          FinLit Ventures • Pause Saver™ Multi-Path Experience
        </span>
      </div>

      {/* Quick Flow Presets for all 5 intents */}
      <div className="flex items-center space-x-1.5 flex-wrap">
        <span className="text-slate-400 text-[11px] font-semibold hidden md:inline-block mr-1">
          Select Path:
        </span>

        {/* Demo A: Market Panic */}
        <button
          onClick={() => onLoadIntent('market_fear')}
          className={`px-2.5 py-1 rounded-[8px] font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer text-[11.5px] ${
            activeIntent === 'market_fear'
              ? 'bg-fintech-teal text-white border-teal-400'
              : 'bg-[#17355B] hover:bg-[#204473] text-teal-300 border-teal-500/30'
          }`}
          title="Demo A: Panicking after market drop"
        >
          <TrendingDown className="w-3 h-3" />
          <span>Demo A: Market Panic</span>
        </button>

        {/* Demo B: Emergency Cash */}
        <button
          onClick={() => onLoadIntent('cash_need')}
          className={`px-2.5 py-1 rounded-[8px] font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer text-[11.5px] ${
            activeIntent === 'cash_need'
              ? 'bg-fintech-teal text-white border-teal-400'
              : 'bg-[#17355B] hover:bg-[#204473] text-emerald-300 border-emerald-500/30'
          }`}
          title="Demo B: Urgent cash shortage / emergency"
        >
          <Wallet className="w-3 h-3" />
          <span>Demo B: Emergency Cash</span>
        </button>

        {/* Demo C: Performance Doubt */}
        <button
          onClick={() => onLoadIntent('performance_doubt')}
          className={`px-2.5 py-1 rounded-[8px] font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer text-[11.5px] ${
            activeIntent === 'performance_doubt'
              ? 'bg-fintech-teal text-white border-teal-400'
              : 'bg-[#17355B] hover:bg-[#204473] text-amber-300 border-amber-500/30'
          }`}
          title="Demo C: Doubting if fund is working"
        >
          <Activity className="w-3 h-3" />
          <span>Demo C: Plan Doubt</span>
        </button>

        {/* Demo D: Goal Changed */}
        <button
          onClick={() => onLoadIntent('goal_change')}
          className={`px-2.5 py-1 rounded-[8px] font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer text-[11.5px] ${
            activeIntent === 'goal_change'
              ? 'bg-fintech-teal text-white border-teal-400'
              : 'bg-[#17355B] hover:bg-[#204473] text-sky-300 border-sky-500/30'
          }`}
          title="Demo D: Target or timeline changed"
        >
          <Target className="w-3 h-3" />
          <span>Demo D: Goal Changed</span>
        </button>

        {/* Demo E: Just Checking */}
        <button
          onClick={() => onLoadIntent('just_checking')}
          className={`px-2.5 py-1 rounded-[8px] font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer text-[11.5px] ${
            activeIntent === 'just_checking'
              ? 'bg-fintech-teal text-white border-teal-400'
              : 'bg-[#17355B] hover:bg-[#204473] text-slate-300 border-slate-500/30'
          }`}
          title="Demo E: Fast lightweight exploration"
        >
          <MoreHorizontal className="w-3 h-3" />
          <span>Demo E: Just Checking</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="px-2.5 py-1 rounded-[8px] bg-[#17355B] hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1 transition-colors cursor-pointer text-[11.5px]"
          title="Reset to Step 1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
