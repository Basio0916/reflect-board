'use client'

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle, Warning } from '@phosphor-icons/react';
import { useTasks } from '@/hooks/use-tasks';
import { useMilestoneContext } from '@/contexts/MilestoneContext';
import { Task, Milestone } from '@/lib/types';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportData {
  exportedAt: string;
  version: string;
  data: {
    tasks: Task[];
    milestones: Milestone[];
  };
}

export function ImportExportDialog({ open, onOpenChange }: ImportExportDialogProps) {
  const { tasks, importTasks } = useTasks();
  const { milestones, importMilestones } = useMilestoneContext();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData: ImportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        tasks: tasks || [],
        milestones: milestones || [],
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflectboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const importData: ImportData = JSON.parse(text);

      if (!importData.data || !importData.data.tasks || !importData.data.milestones) {
        throw new Error('無効なデータ形式です');
      }

      // マイルストーンを先にインポート
      await importMilestones(importData.data.milestones);

      // タスクをインポート
      await importTasks(importData.data.tasks);

      setImportResult({
        success: true,
        message: `${importData.data.tasks.length}件のタスクと${importData.data.milestones.length}件のマイルストーンをインポートしました`,
      });
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'インポートに失敗しました',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>データの管理</DialogTitle>
          <DialogDescription>
            タスクとマイルストーンをインポート/エクスポートできます
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">インポート</TabsTrigger>
            <TabsTrigger value="export">エクスポート</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">JSONファイルを選択</Label>
              <input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="block w-full text-sm text-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  file:cursor-pointer
                  cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                ReflectBoardでエクスポートしたJSONファイルをインポートできます
              </p>
            </div>

            {importing && (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>インポート中...</AlertDescription>
              </Alert>
            )}

            {importResult && (
              <Alert variant={importResult.success ? 'default' : 'destructive'}>
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Warning className="h-4 w-4" />
                )}
                <AlertDescription>{importResult.message}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                現在のすべてのタスクとマイルストーンをJSONファイルとしてダウンロードします。
              </p>
              <div className="bg-muted p-4 rounded-md space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">タスク数:</span> {tasks?.length || 0}件
                </p>
                <p className="text-sm">
                  <span className="font-semibold">マイルストーン数:</span> {milestones?.length || 0}件
                </p>
              </div>
            </div>

            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              エクスポート
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
