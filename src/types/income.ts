export type IncomeType = "salary" | "investment" | "freelance" | "trading" | "other";

export interface IncomeSource {
  id: string;
  name: string;
  type: IncomeType;
  amount: number;
  isFixed: boolean;
  payday?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  salary: "راتب",
  investment: "استثمار",
  freelance: "عمل حر",
  trading: "تداول",
  other: "أخرى",
};
