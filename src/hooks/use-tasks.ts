import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Task, TaskStatus } from '@/lib/types';
import {
  createTask,
  updateTaskStatus,
  reorderTasks,
  reorderTasksInSameColumn,
  toggleTaskStuck,
  getTasksByStatus
} from '@/lib/task-utils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast.error('タスクの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = useCallback(async (title: string, status: TaskStatus = 'todo', description?: string, milestoneId?: string) => {
    try {
      const newTask = createTask(title, status, description, milestoneId);
      
      // Save to API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error('Failed to create task');
      
      const savedTask = await response.json();
      setTasks(currentTasks => [...currentTasks, savedTask]);
      return savedTask;
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('タスクの追加に失敗しました');
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      // Optimistic update
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      );

      // Save to API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      // Update with server response
      setTasks(currentTasks => 
        currentTasks.map(task => task.id === taskId ? updatedTask : task)
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('タスクの更新に失敗しました');
      
      // Revert on error - refetch
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      // Optimistic delete
      setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));

      // Delete from API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('タスクの削除に失敗しました');
      
      // Revert on error - refetch
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
      throw error;
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus, insertIndex?: number) => {
    try {
      let updatedTasks: Task[];
      
      setTasks(currentTasks => {
        const tasksArray = currentTasks;
        const task = tasksArray.find(t => t.id === taskId);
        if (!task) return tasksArray;

        if (insertIndex !== undefined) {
          // Check if it's a reorder within the same column
          if (task.status === newStatus) {
            updatedTasks = reorderTasksInSameColumn(tasksArray, taskId, newStatus, insertIndex);
          } else {
            updatedTasks = reorderTasks(tasksArray, taskId, newStatus, insertIndex);
          }
        } else {
          updatedTasks = tasksArray.map(t => 
            t.id === taskId ? updateTaskStatus(t, newStatus) : t
          );
        }
        
        return updatedTasks;
      });

      // Update task on server
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update task');
        }
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error('タスクの移動に失敗しました');
      
      // Revert on error
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
      throw error;
    }
  }, [tasks]);

  const toggleStuck = useCallback(async (
    taskId: string, 
    isStuck: boolean, 
    stuckReason?: string, 
    stuckSolution?: string
  ) => {
    try {
      // Optimistic update
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId 
            ? toggleTaskStuck(task, isStuck, stuckReason, stuckSolution)
            : task
        )
      );

      // Update on server
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isStuck, 
          stuckContent: stuckReason,
          stuckSolution 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stuck status');
      }
    } catch (error) {
      console.error('Failed to toggle stuck status:', error);
      toast.error('詰まり状況の更新に失敗しました');
      
      // Revert on error
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
      throw error;
    }
  }, []);

  const bulkMoveByStatus = useCallback(async (fromStatus: TaskStatus, toStatus: TaskStatus) => {
    try {
      const tasksArray = tasks;
      const tasksToMove = getTasksByStatus(tasksArray, fromStatus);
      if (tasksToMove.length === 0) return [];

      // Optimistic update
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.status === fromStatus ? updateTaskStatus(task, toStatus) : task
        )
      );

      // Update all tasks on server
      await Promise.all(
        tasksToMove.map(task =>
          fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: toStatus }),
          })
        )
      );

      return tasksToMove;
    } catch (error) {
      console.error('Failed to bulk move tasks:', error);
      toast.error('タスクの一括移動に失敗しました');
      
      // Revert on error
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
      throw error;
    }
  }, [tasks]);

  const getColumnTasks = useCallback((status: TaskStatus) => {
    return getTasksByStatus(tasks, status);
  }, [tasks]);

  const importTasks = useCallback(async (importedTasks: Task[], milestoneIdMap?: Map<string, string>) => {
    try {
      // Delete all existing tasks and create new ones
      const deletePromises = tasks.map(task =>
        fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);

      // Create all imported tasks with updated milestone references
      const createPromises = importedTasks.map(task => {
        const taskData = { ...task };
        
        // If milestoneId exists and we have a mapping, update it
        if (taskData.milestoneId && milestoneIdMap) {
          const newMilestoneId = milestoneIdMap.get(taskData.milestoneId);
          taskData.milestoneId = newMilestoneId || undefined;
        } else if (taskData.milestoneId) {
          // If no mapping provided, set to undefined to avoid foreign key constraint
          taskData.milestoneId = undefined;
        }
        
        return fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      });

      const responses = await Promise.all(createPromises);
      
      // Check for errors in responses
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errorText = await responses[i].text();
          throw new Error(`Failed to create task: ${errorText}`);
        }
      }
      
      const newTasks = await Promise.all(
        responses.map(r => r.json())
      );

      setTasks(newTasks);
      toast.success(`${importedTasks.length}件のタスクをインポートしました`);
    } catch (error) {
      console.error('Failed to import tasks:', error);
      toast.error('タスクのインポートに失敗しました');
      throw error;
    }
  }, [tasks]);

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleStuck,
    bulkMoveByStatus,
    getColumnTasks,
    importTasks,
  };
}