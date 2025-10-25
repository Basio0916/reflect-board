import { useState, useCallback } from 'react';
import { Task, DailySummary, WeeklySummary, Milestone } from '@/lib/types';

export function useLLMSummary() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDailySummary = useCallback(async (
    todaysDoneTasks: Task[], 
    allTasks: Task[], 
    milestones: Milestone[]
  ): Promise<DailySummary | null> => {
    if (todaysDoneTasks.length === 0) return null;
    
    setIsGenerating(true);
    
    try {
      // Get todo and in-progress tasks with milestones that match today's done tasks
      const todaysMilestones = new Set(
        todaysDoneTasks
          .filter(task => task.milestoneId)
          .map(task => task.milestoneId)
      );

      const relatedTasks = allTasks.filter(task => 
        (task.status === 'todo' || task.status === 'in-progress') && 
        task.milestoneId && 
        todaysMilestones.has(task.milestoneId)
      );

      const milestoneMap = milestones.reduce((acc, milestone) => {
        acc[milestone.id] = milestone;
        return acc;
      }, {} as Record<string, Milestone>);

      const summarizeTaskWithMilestone = (task: Task) => ({
        title: task.title,
        description: task.description,
        milestone: task.milestoneId ? milestoneMap[task.milestoneId]?.title : null,
        isStuck: task.isStuck,
        stuckContent: task.stuckContent,
        stuckSolution: task.stuckSolution,
      });

      const todaysTasksData = todaysDoneTasks.map(summarizeTaskWithMilestone);
      const relatedTasksData = relatedTasks.map(summarizeTaskWithMilestone);

      const todaysTasksJson = JSON.stringify(todaysTasksData, null, 2);
      const relatedTasksJson = JSON.stringify(relatedTasksData, null, 2);
      
      const promptText = `今日完了したタスクと関連するマイルストーンの進捗状況を分析して、日次報告用の要約を生成してください。

今日完了したタスク:
${todaysTasksJson}

関連するマイルストーンの未完了タスク:
${relatedTasksJson}

以下のJSON形式で回答してください:
{
  "progress": ["今日完了した主要な項目を箇条書きで。関連するマイルストーンの進捗状況も含める"],
  "blockers": [
    {
      "issue": "詰まった内容",
      "cause": "原因", 
      "solution": "解決方法"
    }
  ]
}

詰まったタスクがない場合は、blockersは空配列にしてください。
マイルストーンがある場合は、その文脈で進捗を整理してください。`;

      const response = await window.spark.llm(promptText, 'gpt-4o', true);
      const summary = JSON.parse(response) as DailySummary;
      
      return summary;
    } catch (error) {
      console.error('Failed to generate daily summary:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateWeeklySummary = useCallback(async (tasks: Task[]): Promise<WeeklySummary | null> => {
    if (tasks.length === 0) return null;
    
    setIsGenerating(true);
    
    try {
      const tasksData = tasks.map(task => ({
        title: task.title,
        description: task.description,
        isStuck: task.isStuck,
        stuckContent: task.stuckContent,
        stuckSolution: task.stuckSolution,
        createdAt: task.createdAt,
      }));

      const tasksJson = JSON.stringify(tasksData, null, 2);
      
      const promptText = `今週完了したタスクのリストを分析して、週次振り返り用の要約を生成してください。

完了したタスク:
${tasksJson}

以下のJSON形式で回答してください:
{
  "highlights": ["主要な成果や達成事項を箇条書きで"],
  "recurringIssues": ["今週中に複数回発生した問題やパターンを箇条書きで"],
  "learnings": ["今週から得られた知見や次に活かせる改善点を箇条書きで"]
}

チーム共有に適した、簡潔で具体的な内容にしてください。
該当する項目がない場合は、空配列にしてください。`;

      const response = await window.spark.llm(promptText, 'gpt-4o', true);
      const summary = JSON.parse(response) as WeeklySummary;
      
      return summary;
    } catch (error) {
      console.error('Failed to generate weekly summary:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generateDailySummary,
    generateWeeklySummary,
  };
}