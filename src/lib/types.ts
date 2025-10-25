export type TaskStatus = 'todo' | 'in-progress' | 'todays-done' | 'weekly-done' | 'done';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  isStuck: boolean;
  stuckContent?: string;
  stuckSolution?: string;
  milestoneId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySummary {
  progress: string[];
  blockers: Array<{
    issue: string;
    cause: string;
    solution: string;
  }>;
}

export interface WeeklySummary {
  highlights: string[];
  recurringIssues: string[];
  learnings: string[];
}

export const COLUMN_CONFIG = {
  todo: {
    id: 'todo' as const,
    title: 'Todo',
    description: 'まだ手をつけていないタスク',
    canAdd: true,
    canBulkMove: false,
    canSummarize: false,
  },
  'in-progress': {
    id: 'in-progress' as const,
    title: 'In Progress', 
    description: '進行中タスク',
    canAdd: true,
    canBulkMove: false,
    canSummarize: false,
  },
  'todays-done': {
    id: 'todays-done' as const,
    title: "Today's Done",
    description: '今日終わったタスク',
    canAdd: false,
    canBulkMove: true,
    canSummarize: true,
    bulkMoveTarget: 'weekly-done' as const,
    bulkMoveLabel: 'Weekly Doneに移動',
  },
  'weekly-done': {
    id: 'weekly-done' as const,
    title: 'Weekly Done',
    description: '今週終わったタスク',
    canAdd: false,
    canBulkMove: true,
    canSummarize: true,
    bulkMoveTarget: 'done' as const,
    bulkMoveLabel: 'Doneに移動',
  },
  done: {
    id: 'done' as const,
    title: 'Done',
    description: '完了したタスクの履歴',
    canAdd: false,
    canBulkMove: false,
    canSummarize: false,
  },
} as const;

export type ColumnId = keyof typeof COLUMN_CONFIG;