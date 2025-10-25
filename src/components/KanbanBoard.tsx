import { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, COLUMN_CONFIG, ColumnId, DailySummary, WeeklySummary } from '@/lib/types';
import { useTasks } from '@/hooks/use-tasks';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { useLLMSummary } from '@/hooks/use-llm-summary';
import { useMilestoneContext } from '@/contexts/MilestoneContext';
import { KanbanColumn } from './KanbanColumn';
import { SummaryDialog } from './SummaryDialog';
import { MilestoneDialog } from './MilestoneDialog';
import { ImportExportDialog } from './ImportExportDialog';
import { Button } from '@/components/ui/button';
import { Flag, Database } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function KanbanBoard() {
  const { tasks, addTask, updateTask, deleteTask, moveTask, bulkMoveByStatus, getColumnTasks } = useTasks();
  const { dragState, isDragging, isDraggedTask, isDragOverColumn, isDragOverTask, handleDragStart, handleDragOver, handleDragEnd } = useDragDrop();
  const { isGenerating, generateDailySummary, generateWeeklySummary } = useLLMSummary();
  const { milestones } = useMilestoneContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [summaryDialog, setSummaryDialog] = useState<{
    open: boolean;
    title: string;
    type: 'daily' | 'weekly';
    summary: DailySummary | WeeklySummary | null;
  }>({
    open: false,
    title: '',
    type: 'daily',
    summary: null,
  });

  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [isImportExportDialogOpen, setIsImportExportDialogOpen] = useState(false);


  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && dragState.draggedTask) {
      try {
        moveTask(taskId, targetStatus);
      } catch (error) {
        // Error already handled in hook with toast
      }
    }
    handleDragEnd();
  };

  const handleTaskDrop = (e: React.DragEvent, targetStatus: TaskStatus, insertIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && dragState.draggedTask) {
      try {
        moveTask(taskId, targetStatus, insertIndex);
      } catch (error) {
        // Error already handled in hook with toast
      }
    }
    handleDragEnd();
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    handleDragOver(columnId);
  };

  const handleTaskDragOver = (e: React.DragEvent, columnId: ColumnId, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragOver(columnId, index);
  };

  const handleBulkMove = (fromStatus: TaskStatus, toStatus: TaskStatus) => {
    try {
      const movedTasks = bulkMoveByStatus(fromStatus, toStatus);
      return movedTasks;
    } catch (error) {
      // Error already handled in hook with toast
    }
  };

  const handleGenerateSummary = async (columnId: ColumnId) => {
    const columnTasks = getColumnTasks(columnId);
    
    if (columnId === 'todays-done') {
      setSummaryDialog({
        open: true,
        title: '今日の振り返り',
        type: 'daily',
        summary: null,
      });
      
      const summary = await generateDailySummary(columnTasks, tasks || [], milestones);
      setSummaryDialog(prev => ({ ...prev, summary }));
      
      if (!summary) {
        toast.error('要約の生成に失敗しました');
      }
    } else if (columnId === 'weekly-done') {
      setSummaryDialog({
        open: true,
        title: '今週の振り返り',
        type: 'weekly',
        summary: null,
      });
      
      const summary = await generateWeeklySummary(columnTasks);
      setSummaryDialog(prev => ({ ...prev, summary }));
      
      if (!summary) {
        toast.error('要約の生成に失敗しました');
      }
    }
  };

  const columns: ColumnId[] = ['todo', 'in-progress', 'todays-done', 'weekly-done', 'done'];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-none px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ReflectBoard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                カンバン式タスク管理で日次・週次の振り返りを効率的に
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsImportExportDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Database size={16} className="mr-2" />
                データ管理
              </Button>
              <Button 
                onClick={() => setIsMilestoneDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Flag size={16} className="mr-2" />
                マイルストーン管理
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div 
          ref={scrollContainerRef}
          className="container max-w-none px-6 py-6 overflow-auto kanban-scroll"
        >
          <div className="flex gap-6 min-w-max pb-6">
            {columns.map((columnId) => {
              const config = COLUMN_CONFIG[columnId];
              const columnTasks = getColumnTasks(columnId);
              
              return (
                <KanbanColumn
                  key={columnId}
                  columnId={columnId}
                  tasks={columnTasks}
                  isDragOver={isDragOverColumn(columnId)}
                  onAddTask={(title, description, milestoneId) => {
                    try {
                      addTask(title, columnId, description, milestoneId);
                    } catch (error) {
                      // Error already handled in hook with toast
                    }
                  }}
                  onUpdateTask={(taskId, updates) => {
                    try {
                      updateTask(taskId, updates);
                    } catch (error) {
                      // Error already handled in hook with toast
                    }
                  }}
                  onDeleteTask={(taskId) => {
                    try {
                      deleteTask(taskId);
                    } catch (error) {
                      // Error already handled in hook with toast
                    }
                  }}
                  onBulkMove={
                    config.canBulkMove && 'bulkMoveTarget' in config
                      ? () => {
                          try {
                            handleBulkMove(columnId, config.bulkMoveTarget);
                          } catch (error) {
                            // Error already handled in hook with toast
                          }
                        }
                      : undefined
                  }
                  onSummarize={
                    config.canSummarize 
                      ? () => handleGenerateSummary(columnId)
                      : undefined
                  }
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOverColumn(e, columnId)}
                  onDrop={(e) => handleDrop(e, columnId)}
                  onTaskDrop={(e, insertIndex) => handleTaskDrop(e, columnId, insertIndex)}
                  onTaskDragOver={(e, index) => handleTaskDragOver(e, columnId, index)}
                  draggedTaskId={dragState.draggedTask?.id}
                  isGeneratingSummary={isGenerating}
                  isDragOverTask={isDragOverTask}
                />
              );
            })}
          </div>
        </div>
      </main>

      <SummaryDialog
        open={summaryDialog.open}
        onOpenChange={(open) => setSummaryDialog(prev => ({ ...prev, open }))}
        summary={summaryDialog.summary}
        title={summaryDialog.title}
        type={summaryDialog.type}
      />
      
      <MilestoneDialog
        open={isMilestoneDialogOpen}
        onOpenChange={setIsMilestoneDialogOpen}
      />

      <ImportExportDialog
        open={isImportExportDialogOpen}
        onOpenChange={setIsImportExportDialogOpen}
      />
    </div>
  );
}