import { createContext, useContext, ReactNode } from 'react';
import { Milestone } from '@/lib/types';
import { useMilestones } from '@/hooks/use-milestones';

interface MilestoneContextType {
  milestones: Milestone[];
  addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMilestone: (id: string, updates: Partial<Pick<Milestone, 'title' | 'description' | 'color'>>) => void;
  deleteMilestone: (id: string) => void;
  getMilestone: (id: string) => Milestone | undefined;
}

const MilestoneContext = createContext<MilestoneContextType | undefined>(undefined);

interface MilestoneProviderProps {
  children: ReactNode;
}

export function MilestoneProvider({ children }: MilestoneProviderProps) {
  const milestoneHook = useMilestones();

  return (
    <MilestoneContext.Provider value={milestoneHook}>
      {children}
    </MilestoneContext.Provider>
  );
}

export function useMilestoneContext() {
  const context = useContext(MilestoneContext);
  if (context === undefined) {
    throw new Error('useMilestoneContext must be used within a MilestoneProvider');
  }
  return context;
}