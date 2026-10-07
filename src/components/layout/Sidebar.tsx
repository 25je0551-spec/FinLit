import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Repeat, 
  Target, 
  PieChart, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import type { InvestorProfile } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  investor: InvestorProfile;
  primaryGoalBadge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  investor,
  primaryGoalBadge = 'Bike'
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'sips', label: 'SIPs', icon: Repeat, badge: '1 Active' },
    { id: 'goals', label: 'Goals', icon: Target, badge: primaryGoalBadge },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'insights', label: 'Insights & AI', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#DCE5EE] flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#DCE5EE] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-[12px] bg-fintech-teal flex items-center justify-center text-white font-bold text-base shadow-subtle">
            FL
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[16px] tracking-tight text-fintech-navy">FinLit</span>
              <span className="text-[10.5px] px-1.5 py-0.5 rounded font-bold bg-fintech-tealLight text-fintech-teal border border-fintech-teal/20">VENTURES</span>
            </div>
            <p className="text-[11.5px] text-fintech-slate font-medium">Smart Wealth Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3.5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-fintech-lightSlate">
          Core Investing
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${
                isActive
                  ? 'bg-[#F0F5FA] text-fintech-navy font-semibold'
                  : 'text-fintech-slate hover:bg-[#F5F8FA] hover:text-fintech-navy'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4.5 h-4.5 transition-colors ${
                    isActive ? 'text-fintech-teal' : 'text-fintech-lightSlate'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full truncate max-w-[88px] inline-block ${
                    isActive
                      ? 'bg-fintech-teal text-white'
                      : 'bg-fintech-tealLight text-fintech-teal border border-fintech-teal/20'
                  }`}
                  title={item.badge}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Feature Spotlight Badge */}
        <div className="mt-6 pt-4 border-t border-[#DCE5EE] px-1">
          <div className="bg-[#EEF8F8] border border-[#CDEAEB] rounded-[16px] p-4 text-left">
            <div className="flex items-center space-x-2 text-fintech-teal mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11.5px] font-bold uppercase tracking-wider">Pause Saver™</span>
            </div>
            <p className="text-[12px] text-fintech-navyMuted leading-relaxed">
              Proactive AI protection preventing premature pause decisions during market drops.
            </p>
            <div className="mt-2.5 flex items-center text-[11.5px] font-semibold text-fintech-teal hover:underline cursor-pointer">
              <span>View active protection</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#DCE5EE] bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-fintech-tealLight border border-fintech-teal/20 text-fintech-teal flex items-center justify-center font-bold text-sm">
            RM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-fintech-navy truncate">{investor.name}</p>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>KYC {investor.kycStatus}</span>
            </div>
          </div>
          <button 
            title="Help & Support"
            className="text-fintech-lightSlate hover:text-fintech-navy p-1 rounded-md transition-colors"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
