export type TaskStatus = "pending" | "done" | "partial" | "missed";
export type TaskFrequency = "daily" | "weekly";
export type TaskType = "financial" | "educational";

export interface Task {
  id: string;
  title: string;
  centerId: string;
  centerKey: string;
  requiredAmount: number;
  completedAmount: number;
  date: string; // YYYY-MM-DD
  frequency: TaskFrequency;
  status: TaskStatus;
  type: TaskType;
  weight: number;
  postponedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "بانتظار",
  done: "تم",
  partial: "جزئي",
  missed: "لم يتم",
};
