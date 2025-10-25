import { useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/lib/types';

export interface DragState {
  draggedTask: Task | null;
  dragOverColumn: TaskStatus | null;
  dragOverIndex: number | null;
  isDragBetweenColumns: boolean;
}

export function useDragDrop() {
  const [dragState, setDragState] = useState<DragState>({
    draggedTask: null,
    dragOverColumn: null,
    dragOverIndex: null,
    isDragBetweenColumns: false,
  });

  const handleDragStart = useCallback((task: Task) => {
    setDragState(prev => ({
      ...prev,
      draggedTask: task,
    }));
  }, []);

  const handleDragOver = useCallback((column: TaskStatus, index: number | null = null) => {
    setDragState(prev => ({
      ...prev,
      dragOverColumn: column,
      dragOverIndex: index,
      isDragBetweenColumns: prev.draggedTask ? prev.draggedTask.status !== column : false,
    }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedTask: null,
      dragOverColumn: null,
      dragOverIndex: null,
      isDragBetweenColumns: false,
    });
  }, []);

  const isDragging = dragState.draggedTask !== null;
  const isDraggedTask = useCallback((taskId: string) => {
    return dragState.draggedTask?.id === taskId;
  }, [dragState.draggedTask]);

  const isDragOverColumn = useCallback((column: TaskStatus) => {
    return dragState.dragOverColumn === column;
  }, [dragState.dragOverColumn]);

  const isDragOverTask = useCallback((taskId: string, index: number) => {
    return dragState.dragOverColumn !== null && 
           dragState.dragOverIndex === index &&
           dragState.draggedTask?.id !== taskId;
  }, [dragState.dragOverColumn, dragState.dragOverIndex, dragState.draggedTask]);

  return {
    dragState,
    isDragging,
    isDraggedTask,
    isDragOverColumn,
    isDragOverTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}