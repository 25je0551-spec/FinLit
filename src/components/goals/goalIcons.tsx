import React from 'react';
import { 
  Bike, 
  Shield, 
  GraduationCap, 
  Laptop, 
  Home, 
  Plane, 
  Heart, 
  Landmark, 
  Car, 
  Target, 
  PiggyBank,
  Briefcase,
  LucideProps
} from 'lucide-react';

export const AVAILABLE_GOAL_ICONS: Array<{ name: string; label: string; icon: React.ComponentType<LucideProps> }> = [
  { name: 'Bike', label: 'Bike / Motorbike', icon: Bike },
  { name: 'Car', label: 'Car / Vehicle', icon: Car },
  { name: 'Shield', label: 'Emergency Fund', icon: Shield },
  { name: 'GraduationCap', label: 'Education', icon: GraduationCap },
  { name: 'Home', label: 'Home / Property', icon: Home },
  { name: 'Plane', label: 'Travel / Vacation', icon: Plane },
  { name: 'Laptop', label: 'Tech / Gadget', icon: Laptop },
  { name: 'PiggyBank', label: 'General Savings', icon: PiggyBank },
  { name: 'Landmark', label: 'Retirement / Estate', icon: Landmark },
  { name: 'Heart', label: 'Family / Wedding', icon: Heart },
  { name: 'Briefcase', label: 'Business / Career', icon: Briefcase },
  { name: 'Target', label: 'Milestone Target', icon: Target },
];

export function renderGoalIcon(iconName: string, props?: LucideProps): React.ReactElement {
  const normalized = iconName.toLowerCase();
  switch (normalized) {
    case 'bike':
      return <Bike {...props} />;
    case 'car':
      return <Car {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'graduationcap':
    case 'education':
      return <GraduationCap {...props} />;
    case 'home':
      return <Home {...props} />;
    case 'plane':
    case 'travel':
      return <Plane {...props} />;
    case 'laptop':
      return <Laptop {...props} />;
    case 'piggybank':
      return <PiggyBank {...props} />;
    case 'landmark':
      return <Landmark {...props} />;
    case 'heart':
      return <Heart {...props} />;
    case 'briefcase':
      return <Briefcase {...props} />;
    default:
      return <Target {...props} />;
  }
}
