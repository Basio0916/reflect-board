import { useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
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
  const [tasks, setTasks] = useKV<Task[]>('reflect-board-tasks', []);

  const addTask = useCallback((title: string, status: TaskStatus = 'todo', description?: string, milestoneId?: string) => {
    try {
      const newTask = createTask(title, status, description, milestoneId);
      setTasks(currentTasks => [...(currentTasks || []), newTask]);
      return newTask;
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('タスクの追加に失敗しました');
      throw error;
    }
  }, [setTasks]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    try {
      setTasks(currentTasks => 
        (currentTasks || []).map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('タスクの更新に失敗しました');
      throw error;
    }
  }, [setTasks]);

  const deleteTask = useCallback((taskId: string) => {
    try {
      setTasks(currentTasks => (currentTasks || []).filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('タスクの削除に失敗しました');
      throw error;
    }
  }, [setTasks]);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus, insertIndex?: number) => {
    try {
      setTasks(currentTasks => {
        const tasksArray = currentTasks || [];
        const task = tasksArray.find(t => t.id === taskId);
        if (!task) return tasksArray;

        if (insertIndex !== undefined) {
          // Check if it's a reorder within the same column
          if (task.status === newStatus) {
            return reorderTasksInSameColumn(tasksArray, taskId, newStatus, insertIndex);
          } else {
            return reorderTasks(tasksArray, taskId, newStatus, insertIndex);
          }
        } else {
          return tasksArray.map(t => 
            t.id === taskId ? updateTaskStatus(t, newStatus) : t
          );
        }
      });
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error('タスクの移動に失敗しました');
      throw error;
    }
  }, [setTasks]);

  const toggleStuck = useCallback((
    taskId: string, 
    isStuck: boolean, 
    stuckReason?: string, 
    stuckSolution?: string
  ) => {
    try {
      setTasks(currentTasks => 
        (currentTasks || []).map(task => 
          task.id === taskId 
            ? toggleTaskStuck(task, isStuck, stuckReason, stuckSolution)
            : task
        )
      );
    } catch (error) {
      console.error('Failed to toggle stuck status:', error);
      toast.error('詰まり状況の更新に失敗しました');
      throw error;
    }
  }, [setTasks]);

  const bulkMoveByStatus = useCallback((fromStatus: TaskStatus, toStatus: TaskStatus) => {
    try {
      const tasksArray = tasks || [];
      const tasksToMove = getTasksByStatus(tasksArray, fromStatus);
      if (tasksToMove.length === 0) return [];

      setTasks(currentTasks => 
        (currentTasks || []).map(task => 
          task.status === fromStatus ? updateTaskStatus(task, toStatus) : task
        )
      );

      return tasksToMove;
    } catch (error) {
      console.error('Failed to bulk move tasks:', error);
      toast.error('タスクの一括移動に失敗しました');
      throw error;
    }
  }, [tasks, setTasks]);

  const getColumnTasks = useCallback((status: TaskStatus) => {
    return getTasksByStatus(tasks || [], status);
  }, [tasks]);

  return {
    tasks: tasks || [],
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleStuck,
    bulkMoveByStatus,
    getColumnTasks,
  };
}