export type FinancialCenterKey = "expenses" | "balance" | "charity" | "readiness" | "debts";

export interface FinancialCenter {
  id: string;
  key: FinancialCenterKey;
  nameAr: string;
  descriptionAr: string;
  percentage: number;
  monthlyAmount: number;
  dailyAmount: number;
  currentBalance: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
