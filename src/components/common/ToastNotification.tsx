import React from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  subtext?: string;
  onDismiss: () => void;
  onAction?: () => void;
  actionText?: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  subtext,
  onDismiss,
  onAction,
  actionText = 'Modify or Extend',
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white rounded-[16px] shadow-card border border-[#CDEAEB] p-4.5 animate-slide-in text-left">
      <div className="flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-[10px] bg-fintech-tealLight text-fintech-teal flex items-center justify-center shrink-0">
          <Bell className="w-4.5 h-4.5 text-fintech-teal stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-[13px] font-bold text-fintech-navy">
              Pause Saver™ Safety Net Alert
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fintech-teal text-white">
              7 Days Prior
            </span>
          </div>
          <p className="text-[12.5px] font-medium text-fintech-navyMuted mt-1 leading-snug">
            {message}
          </p>
          {subtext && (
            <p className="text-[11.5px] text-fintech-slate mt-0.5">{subtext}</p>
          )}

          {onAction && (
            <div className="mt-2 flex items-center space-x-3">
              <button
                onClick={onAction}
                className="text-[12px] font-bold text-fintech-teal hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>{actionText}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-fintech-lightSlate hover:text-fintech-navy p-1 rounded-md transition-colors cursor-pointer"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
