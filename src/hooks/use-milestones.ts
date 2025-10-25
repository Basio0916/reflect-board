import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Milestone } from '@/lib/types';

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch milestones from API
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/api/milestones');
        if (!response.ok) throw new Error('Failed to fetch milestones');
        const data = await response.json();
        setMilestones(data);
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
        toast.error('マイルストーンの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  const addMilestone = useCallback(async (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMilestone: Milestone = {
        ...milestone,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to API
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone),
      });

      if (!response.ok) throw new Error('Failed to create milestone');
      
      const savedMilestone = await response.json();
      setMilestones((current) => [...current, savedMilestone]);
    } catch (error) {
      console.error('Failed to add milestone:', error);
      toast.error('マイルストーンの追加に失敗しました');
      throw error;
    }
  }, []);

  const updateMilestone = useCallback(async (id: string, updates: Partial<Pick<Milestone, 'title' | 'description' | 'color'>>) => {
    try {
      // Optimistic update
      setMilestones((current) =>
        current.map((milestone) =>
          milestone.id === id
            ? { ...milestone, ...updates, updatedAt: new Date() }
            : milestone
        )
      );

      // Save to API
      const response = await fetch(`/api/milestones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      const updatedMilestone = await response.json();
      
      // Update with server response
      setMilestones((current) =>
        current.map((milestone) => milestone.id === id ? updatedMilestone : milestone)
      );
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast.error('マイルストーンの更新に失敗しました');
      
      // Revert on error - refetch
      const response = await fetch('/api/milestones');
      if (response.ok) {
        const data = await response.json();
        setMilestones(data);
      }
      throw error;
    }
  }, []);

  const deleteMilestone = useCallback(async (id: string) => {
    try {
      // Optimistic delete
      setMilestones((current) => current.filter((milestone) => milestone.id !== id));

      // Delete from API
      const response = await fetch(`/api/milestones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete milestone');
      }
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      toast.error('マイルストーンの削除に失敗しました');
      
      // Revert on error - refetch
      const response = await fetch('/api/milestones');
      if (response.ok) {
        const data = await response.json();
        setMilestones(data);
      }
      throw error;
    }
  }, []);

  const getMilestone = useCallback((id: string) => {
    return milestones.find((milestone) => milestone.id === id);
  }, [milestones]);

  const importMilestones = useCallback(async (importedMilestones: Milestone[]): Promise<Map<string, string>> => {
    try {
      // Delete all existing milestones and create new ones
      const deletePromises = milestones.map(milestone =>
        fetch(`/api/milestones/${milestone.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);

      // Create all imported milestones and track ID mappings
      const idMap = new Map<string, string>();
      
      const createPromises = importedMilestones.map(async milestone => {
        const oldId = milestone.id;
        const response = await fetch('/api/milestones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(milestone),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create milestone: ${await response.text()}`);
        }
        
        const newMilestone = await response.json();
        idMap.set(oldId, newMilestone.id);
        return newMilestone;
      });

      const newMilestones = await Promise.all(createPromises);

      setMilestones(newMilestones);
      toast.success(`${importedMilestones.length}件のマイルストーンをインポートしました`);
      
      return idMap;
    } catch (error) {
      console.error('Failed to import milestones:', error);
      toast.error('マイルストーンのインポートに失敗しました');
      throw error;
    }
  }, [milestones]);

  return {
    milestones,
    isLoading,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestone,
    importMilestones,
  };
}