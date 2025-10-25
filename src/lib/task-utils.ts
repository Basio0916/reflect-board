import { Task, TaskStatus } from './types';

export function createTask(
  title: string,
  status: TaskStatus = 'todo',
  description?: string,
  milestoneId?: string
): Task {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title,
    description,
    status,
    isStuck: false,
    milestoneId,
    order: Date.now(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTaskStatus(task: Task, newStatus: TaskStatus): Task {
  return {
    ...task,
    status: newStatus,
    updatedAt: new Date(),
  };
}

export function updateTaskOrder(task: Task, newOrder: number): Task {
  return {
    ...task,
    order: newOrder,
    updatedAt: new Date(),
  };
}

export function toggleTaskStuck(
  task: Task,
  isStuck: boolean,
  stuckContent?: string,
  stuckSolution?: string
): Task {
  return {
    ...task,
    isStuck,
    stuckContent: isStuck ? stuckContent : undefined,
    stuckSolution: isStuck ? stuckSolution : undefined,
    updatedAt: new Date(),
  };
}

export function getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks
    .filter(task => task.status === status)
    .sort((a, b) => a.order - b.order);
}

export function getMaxOrderInStatus(tasks: Task[], status: TaskStatus): number {
  const statusTasks = getTasksByStatus(tasks, status);
  if (statusTasks.length === 0) return 0;
  return Math.max(...statusTasks.map(task => task.order));
}

export function reorderTasks(
  tasks: Task[],
  draggedTaskId: string,
  newStatus: TaskStatus,
  insertIndex: number
): Task[] {
  const draggedTask = tasks.find(task => task.id === draggedTaskId);
  if (!draggedTask) return tasks;

  const otherTasks = tasks.filter(task => task.id !== draggedTaskId);
  const statusTasks = getTasksByStatus(otherTasks, newStatus);
  
  // Insert the dragged task at the specified index
  statusTasks.splice(insertIndex, 0, updateTaskStatus(draggedTask, newStatus));
  
  // Reassign order values
  const reorderedStatusTasks = statusTasks.map((task, index) => 
    updateTaskOrder(task, index + 1)
  );

  // Combine with other status tasks
  const otherStatusTasks = otherTasks.filter(task => task.status !== newStatus);
  
  return [...otherStatusTasks, ...reorderedStatusTasks];
}

export function reorderTasksInSameColumn(
  tasks: Task[],
  draggedTaskId: string,
  status: TaskStatus,
  newIndex: number
): Task[] {
  const statusTasks = getTasksByStatus(tasks, status);
  const draggedTaskIndex = statusTasks.findIndex(task => task.id === draggedTaskId);
  
  if (draggedTaskIndex === -1 || draggedTaskIndex === newIndex) {
    return tasks;
  }

  // Remove dragged task and insert at new position
  const reorderedStatusTasks = [...statusTasks];
  const [draggedTask] = reorderedStatusTasks.splice(draggedTaskIndex, 1);
  reorderedStatusTasks.splice(newIndex, 0, draggedTask);

  // Reassign order values
  const finalStatusTasks = reorderedStatusTasks.map((task, index) =>
    updateTaskOrder(task, index + 1)
  );

  // Replace the status tasks in the full task list
  const otherTasks = tasks.filter(task => task.status !== status);
  return [...otherTasks, ...finalStatusTasks];
}