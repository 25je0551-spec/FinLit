import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import type { StepId } from '../../types';

interface ProgressIndicatorProps {
  currentStep: StepId;
  onStepClick?: (step: StepId) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps: Array<{ id: StepId; label: string; stepNumber: number }> = [
    { id: 'sip-detail', label: 'SIP Detail', stepNumber: 1 },
    { id: 'intent-detection', label: 'Intent Check', stepNumber: 2 },
    { id: 'goal-impact', label: 'Goal Impact', stepNumber: 3 },
    { id: 'decision-ladder', label: 'Smart Ladder', stepNumber: 4 },
    { id: 'confirmation', label: 'Safety Net', stepNumber: 5 },
  ];

  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white border-b border-[#DCE5EE] px-6 sm:px-8 py-3 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-[8px] bg-fintech-tealLight border border-fintech-teal/20 flex items-center justify-center text-fintech-teal">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[12px] font-bold text-fintech-navy uppercase tracking-wider">
            Pause Saver™ Flow
          </span>
        </div>

        {/* Step dots & labels */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <React.Fragment key={step.id}>
                <div 
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-fintech-teal text-white'
                        : isCurrent
                        ? 'bg-fintech-navy text-white ring-3 ring-fintech-tealLight'
                        : 'bg-[#E2E8F0] text-fintech-slate'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.8]" /> : step.stepNumber}
                  </div>
                  <span
                    className={`text-[12.5px] hidden sm:inline-block font-semibold transition-colors whitespace-nowrap ${
                      isCurrent
                        ? 'text-fintech-navy font-bold'
                        : isCompleted
                        ? 'text-fintech-teal'
                        : 'text-fintech-lightSlate'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`w-6 sm:w-8 h-[2px] rounded-full transition-colors shrink-0 ${
                      idx < currentIdx ? 'bg-fintech-teal' : 'bg-[#E2E8F0]'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
