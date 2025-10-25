import { useLocalStorage } from './use-local-storage';
import { toast } from 'sonner';
import { Milestone } from '@/lib/types';

export function useMilestones() {
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>('milestones', []);

  const addMilestone = (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMilestone: Milestone = {
        ...milestone,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMilestones((current) => [...(current || []), newMilestone]);
    } catch (error) {
      console.error('Failed to add milestone:', error);
      toast.error('マイルストーンの追加に失敗しました');
      throw error;
    }
  };

  const updateMilestone = (id: string, updates: Partial<Pick<Milestone, 'title' | 'description' | 'color'>>) => {
    try {
      setMilestones((current) =>
        (current || []).map((milestone) =>
          milestone.id === id
            ? { ...milestone, ...updates, updatedAt: new Date() }
            : milestone
        )
      );
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast.error('マイルストーンの更新に失敗しました');
      throw error;
    }
  };

  const deleteMilestone = (id: string) => {
    try {
      setMilestones((current) => (current || []).filter((milestone) => milestone.id !== id));
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      toast.error('マイルストーンの削除に失敗しました');
      throw error;
    }
  };

  const getMilestone = (id: string) => {
    return (milestones || []).find((milestone) => milestone.id === id);
  };

  const importMilestones = async (importedMilestones: Milestone[]) => {
    try {
      setMilestones(importedMilestones);
      toast.success(`${importedMilestones.length}件のマイルストーンをインポートしました`);
    } catch (error) {
      console.error('Failed to import milestones:', error);
      toast.error('マイルストーンのインポートに失敗しました');
      throw error;
    }
  };

  return {
    milestones: milestones || [],
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestone,
    importMilestones,
  };
}