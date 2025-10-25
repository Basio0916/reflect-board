import { useState } from 'react';
import { Milestone } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash, X } from '@phosphor-icons/react';
import { useMilestoneContext } from '@/contexts/MilestoneContext';
import { toast } from 'sonner';

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MILESTONE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
];

export function MilestoneDialog({ open, onOpenChange }: MilestoneDialogProps) {
  const { milestones, addMilestone, updateMilestone, deleteMilestone } = useMilestoneContext();
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: MILESTONE_COLORS[0],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      color: MILESTONE_COLORS[0],
    });
    setEditingMilestone(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      color: MILESTONE_COLORS[0],
    });
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      color: milestone.color,
    });
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('マイルストーン名を入力してください');
      return;
    }

    try {
      if (editingMilestone) {
        updateMilestone(editingMilestone.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
        toast.success('マイルストーンを更新しました');
      } else {
        addMilestone({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
        toast.success('マイルストーンを作成しました');
      }

      resetForm();
    } catch (error) {
      // Error already handled in hook with toast
    }
  };

  const handleDelete = (milestone: Milestone) => {
    if (confirm(`マイルストーン「${milestone.title}」を削除しますか？\n関連するタスクからマイルストーンの情報が削除されます。`)) {
      try {
        deleteMilestone(milestone.id);
        toast.success('マイルストーンを削除しました');
      } catch (error) {
        // Error already handled in hook with toast
      }
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>マイルストーン管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create/Edit Form */}
          {(isCreating || editingMilestone) && (
            <div className="bg-secondary/30 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {editingMilestone ? 'マイルストーンを編集' : '新しいマイルストーン'}
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X size={16} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="milestone-title">マイルストーン名 *</Label>
                  <Input
                    id="milestone-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: v1.0リリース"
                  />
                </div>

                <div>
                  <Label htmlFor="milestone-description">説明（任意）</Label>
                  <Textarea
                    id="milestone-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="マイルストーンの詳細説明"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>カラー</Label>
                  <div className="flex gap-2 mt-2">
                    {MILESTONE_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-primary' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    {editingMilestone ? '更新' : '作成'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    キャンセル
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Create Button */}
          {!isCreating && !editingMilestone && (
            <Button onClick={handleCreate} className="w-full">
              <Plus size={16} className="mr-2" />
              新しいマイルストーンを作成
            </Button>
          )}

          {/* Milestones List */}
          {milestones.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium text-sm">作成済みマイルストーン</h3>
                <div className="space-y-2">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: milestone.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(milestone)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(milestone)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}