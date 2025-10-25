import { useState } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Warning, Pencil, Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useMilestoneContext } from '@/contexts/MilestoneContext';
import { useAutoScroll } from '@/hooks/use-auto-scroll';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
  isDraggedOver?: boolean;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
}

export function TaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  isDragging = false,
  isDraggedOver = false,
  onDragStart,
  onDragEnd 
}: TaskCardProps) {
  const { milestones, getMilestone } = useMilestoneContext();
  const { startAutoScroll, stopAutoScroll } = useAutoScroll();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    milestoneId: task.milestoneId || '',
    isStuck: task.isStuck,
    stuckContent: task.stuckContent || '',
    stuckSolution: task.stuckSolution || '',
  });

  const currentMilestone = task.milestoneId ? getMilestone(task.milestoneId) : null;

  // Update form when task changes or dialog opens
  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setEditForm({
        title: task.title,
        description: task.description || '',
        milestoneId: task.milestoneId || '',
        isStuck: task.isStuck,
        stuckContent: task.stuckContent || '',
        stuckSolution: task.stuckSolution || '',
      });
    }
    setIsEditOpen(open);
  };

  const handleSave = () => {
    try {
      onUpdate(task.id, {
        title: editForm.title,
        description: editForm.description,
        milestoneId: editForm.milestoneId || undefined,
        isStuck: editForm.isStuck,
        stuckContent: editForm.isStuck ? editForm.stuckContent : undefined,
        stuckSolution: editForm.isStuck ? editForm.stuckSolution : undefined,
      });
      handleDialogOpenChange(false);
    } catch (error) {
      // Error already handled in hook with toast
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart(task);
    startAutoScroll(e.clientY);
  };

  const handleDrag = (e: React.DragEvent) => {
    // Continue auto-scrolling during drag with more frequent updates
    if (e.clientY > 0) { // Only if we have valid coordinates
      startAutoScroll(e.clientY);
    }
  };

  const handleDragEndWithCleanup = () => {
    stopAutoScroll();
    onDragEnd();
  };

  return (
    <Card
      className={cn(
        'cursor-move transition-all duration-200 w-full max-w-full',
        'hover:shadow-md',
        task.isStuck && 'border-warning bg-warning/5',
        isDragging && 'opacity-50 rotate-2 scale-105',
        isDraggedOver && 'border-primary bg-primary/5'
      )}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEndWithCleanup}
    >
      <CardHeader className="pb-1 px-2 pt-2">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-medium text-sm leading-tight truncate">{task.title}</h3>
            {currentMilestone && (
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 inline-block max-w-[calc(100%-12px)] truncate"
                style={{ 
                  backgroundColor: `${currentMilestone.color}20`,
                  borderColor: `${currentMilestone.color}40`,
                  color: currentMilestone.color 
                }}
                title={currentMilestone.title}
              >
                {currentMilestone.title.length > 12 
                  ? `${currentMilestone.title.slice(0, 12)}...` 
                  : currentMilestone.title
                }
              </Badge>
            )}
          </div>
          <div className="flex items-start gap-1 flex-shrink-0 ml-1.5">
            {task.isStuck && (
              <Warning size={14} className="text-warning flex-shrink-0" />
            )}
            <Dialog open={isEditOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 flex-shrink-0">
                  <Pencil size={10} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>タスクを編集</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">説明（任意）</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone">マイルストーン（任意）</Label>
                    <Select
                      value={editForm.milestoneId || undefined}
                      onValueChange={(value) => setEditForm({ ...editForm, milestoneId: value === "none" ? "" : value })}
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stuck"
                      checked={editForm.isStuck}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, isStuck: checked })}
                    />
                    <Label htmlFor="stuck">詰まった</Label>
                  </div>
                  {editForm.isStuck && (
                    <div className="space-y-3 pl-4 border-l-2 border-warning">
                      <div className="space-y-2">
                        <Label htmlFor="stuckContent">詰まった内容</Label>
                        <Textarea
                          id="stuckContent"
                          value={editForm.stuckContent}
                          onChange={(e) => setEditForm({ ...editForm, stuckContent: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stuckSolution">解決方法</Label>
                        <Textarea
                          id="stuckSolution"
                          value={editForm.stuckSolution}
                          onChange={(e) => setEditForm({ ...editForm, stuckSolution: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        try {
                          onDelete(task.id);
                          handleDialogOpenChange(false);
                        } catch (error) {
                          // Error already handled in hook with toast
                        }
                      }}
                    >
                      <Trash size={14} className="mr-1" />
                      削除
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleDialogOpenChange(false)}>
                        キャンセル
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        保存
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}