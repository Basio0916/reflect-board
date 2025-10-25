import { useState } from 'react';
import { DailySummary, WeeklySummary } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: DailySummary | WeeklySummary | null;
  title: string;
  type: 'daily' | 'weekly';
}

export function SummaryDialog({ open, onOpenChange, summary, title, type }: SummaryDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let textToCopy = '';
    
    if (type === 'daily' && summary && typeof summary === 'object' && 'progress' in summary) {
      const dailySummary = summary as DailySummary;
      textToCopy = `## 今日の進捗
${dailySummary.progress.map(item => `- ${item}`).join('\n')}

${dailySummary.blockers.length > 0 ? `## 詰まったこと
${dailySummary.blockers.map(blocker => `- **${blocker.issue}**
  - 原因: ${blocker.cause}
  - 解決: ${blocker.solution}`).join('\n')}` : ''}`;
    } else if (type === 'weekly' && summary && typeof summary === 'object' && 'highlights' in summary) {
      const weeklySummary = summary as WeeklySummary;
      textToCopy = `## 今週のハイライト
${weeklySummary.highlights.map(item => `- ${item}`).join('\n')}

${weeklySummary.recurringIssues.length > 0 ? `## 繰り返し出た課題
${weeklySummary.recurringIssues.map(item => `- ${item}`).join('\n')}

` : ''}${weeklySummary.learnings.length > 0 ? `## 学び・改善点
${weeklySummary.learnings.map(item => `- ${item}`).join('\n')}` : ''}`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('クリップボードにコピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const renderDailySummary = (summary: DailySummary) => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-primary">今日の進捗</h3>
        <ul className="space-y-2">
          {summary.progress.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {summary.blockers.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-sm mb-3 text-warning">詰まったこと</h3>
            <div className="space-y-4">
              {summary.blockers.map((blocker, index) => (
                <div key={index} className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">{blocker.issue}</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><strong>原因:</strong> {blocker.cause}</p>
                    <p><strong>解決:</strong> {blocker.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderWeeklySummary = (summary: WeeklySummary) => (
    <div className="space-y-6">
      {summary.highlights.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3 text-primary">今週のハイライト</h3>
          <ul className="space-y-2">
            {summary.highlights.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.recurringIssues.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-sm mb-3 text-warning">繰り返し出た課題</h3>
            <ul className="space-y-2">
              {summary.recurringIssues.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {summary.learnings.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary">学び・改善点</h3>
            <ul className="space-y-2">
              {summary.learnings.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            {summary && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check size={14} className="mr-1 text-success" />
                ) : (
                  <Copy size={14} className="mr-1" />
                )}
                {copied ? 'コピー済み' : 'コピー'}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {!summary ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              要約を生成中...
            </div>
          ) : type === 'daily' && typeof summary === 'object' && 'progress' in summary ? (
            renderDailySummary(summary as DailySummary)
          ) : type === 'weekly' && typeof summary === 'object' && 'highlights' in summary ? (
            renderWeeklySummary(summary as WeeklySummary)
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              要約の生成に失敗しました
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}