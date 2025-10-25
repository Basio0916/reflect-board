'use client'

import { KanbanBoard } from '@/components/KanbanBoard';
import { MilestoneProvider } from '@/contexts/MilestoneContext';
import { Toaster } from 'sonner';

export default function Home() {
  return (
    <MilestoneProvider>
      <div className="min-h-screen">
        <KanbanBoard />
        <Toaster position="top-right" />
      </div>
    </MilestoneProvider>
  );
}
