import { useState } from 'react';
import { Task, TaskStatus, COLUMN_CONFIG, ColumnId } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCard } from './TaskCard';
import { Plus, ArrowRight, FileText, Copy, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMilestoneContext } from '@/contexts/MilestoneContext';

interface KanbanColumnProps {
  columnId: ColumnId;
  tasks: Task[];
  isDragOver: boolean;
  onAddTask: (title: string, description?: string, milestoneId?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onBulkMove?: () => void;
  onSummarize?: () => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, insertIndex: number) => void;
  onTaskDragOver: (e: React.DragEvent, index: number) => void;
  draggedTaskId?: string;
  isGeneratingSummary?: boolean;
  isDragOverTask?: (taskId: string, index: number) => boolean;
}

export function KanbanColumn({
  columnId,
  tasks,
  isDragOver,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onBulkMove,
  onSummarize,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTaskDrop,
  onTaskDragOver,
  draggedTaskId,
  isGeneratingSummary = false,
  isDragOverTask,
}: KanbanColumnProps) {
  const { milestones } = useMilestoneContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    milestoneId: '',
  });

  const config = COLUMN_CONFIG[columnId];

  const handleAddTask = () => {
    if (newTaskForm.title.trim()) {
      try {
        onAddTask(
          newTaskForm.title, 
          newTaskForm.description || undefined,
          newTaskForm.milestoneId || undefined
        );
        setNewTaskForm({ title: '', description: '', milestoneId: '' });
        setIsAddDialogOpen(false);
      } catch (error) {
        // Error already handled in hook with toast
      }
    }
  };

  const handleBulkMove = () => {
    if (onBulkMove && tasks.length > 0 && 'bulkMoveLabel' in config) {
      try {
        onBulkMove();
        toast.success(`${tasks.length}件のタスクを${config.bulkMoveLabel}しました`, {
          action: {
            label: 'Undo',
            onClick: () => {
              // TODO: Implement undo functionality
              toast.info('Undo機能は実装予定です');
            }
          }
        });
      } catch (error) {
        // Error already handled in hook with toast
      }
    }
  };

  // Calculate minimum height based on task count
  const minContentHeight = Math.max(128, tasks.length * 80 + 32); // 80px per task + padding

  return (
    <div className="flex flex-col w-80 flex-shrink-0 min-h-fit">
      <Card className="flex flex-col h-fit">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                {tasks.length}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            {config.canAdd && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-1">
                    <Plus size={14} className="mr-1" />
                    追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>新しいタスク</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-title" className="text-sm font-medium">
                        タイトル
                      </Label>
                      <Input
                        id="new-title"
                        value={newTaskForm.title}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                        placeholder="タスクのタイトルを入力"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-description" className="text-sm font-medium">
                        説明（任意）
                      </Label>
                      <Textarea
                        id="new-description"
                        value={newTaskForm.description}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                        rows={3}
                        placeholder="タスクの詳細を入力"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-milestone" className="text-sm font-medium">
                        マイルストーン（任意）
                      </Label>
                      <Select
                        value={newTaskForm.milestoneId || undefined}
                        onValueChange={(value) => setNewTaskForm({ ...newTaskForm, milestoneId: value === "none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="マイルストーンを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">なし</SelectItem>
                          {milestones.map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: milestone.color }}
                                />
                                {milestone.title}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleAddTask} disabled={!newTaskForm.title.trim()}>
                        追加
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {config.canBulkMove && 'bulkMoveLabel' in config && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleBulkMove}
                disabled={tasks.length === 0}
                className="flex-1"
              >
                <ArrowRight size={14} className="mr-1" />
                {config.bulkMoveLabel}
              </Button>
            )}
            
            {config.canSummarize && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onSummarize}
                disabled={tasks.length === 0 || isGeneratingSummary}
                className="flex-1"
              >
                {isGeneratingSummary ? (
                  <Sparkle size={14} className="mr-1 animate-spin" />
                ) : (
                  <FileText size={14} className="mr-1" />
                )}
                要約
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent 
          className={cn(
            'flex-1 space-y-2 transition-colors pb-4',
            isDragOver && 'bg-primary/5 border-dashed border-2 border-primary'
          )}
          style={{ minHeight: `${minContentHeight}px` }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              {config.canAdd ? 'タスクを追加してください' : 'タスクがありません'}
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={task.id} className="relative">
                  {/* Drop zone above task */}
                  <div
                    className={cn(
                      'absolute -top-1.5 left-0 right-0 h-3 transition-colors',
                      isDragOverTask && isDragOverTask(task.id, index) &&
                      'bg-primary/20 border-t-2 border-primary'
                    )}
                    onDragOver={(e) => onTaskDragOver(e, index)}
                    onDrop={(e) => onTaskDrop(e, index)}
                  />
                  
                  <div className="w-full">
                    <TaskCard
                      task={task}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      isDragging={draggedTaskId === task.id}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  </div>
                  
                  {/* Drop zone after last task */}
                  {index === tasks.length - 1 && (
                    <div
                      className={cn(
                        'absolute -bottom-1.5 left-0 right-0 h-3 transition-colors',
                        isDragOverTask && isDragOverTask(task.id, index + 1) &&
                        'bg-primary/20 border-b-2 border-primary'
                      )}
                      onDragOver={(e) => onTaskDragOver(e, index + 1)}
                      onDrop={(e) => onTaskDrop(e, index + 1)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}