export const totalIncome = (sources: { amount: number }[]): number =>
  sources.reduce((sum, s) => sum + s.amount, 0);

export const centerMonthlyAmount = (income: number, percentage: number): number =>
  (income * percentage) / 100;

export const daysBetweenPaydays = (currentPayday: Date, nextPayday: Date): number => {
  const diff = nextPayday.getTime() - currentPayday.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const dailyAmount = (monthly: number, days: number): number =>
  days > 0 ? monthly / days : 0;

export const balanceCenterMax = (income: number): number => income * 3;

export const foundationProgress = (
  tasks: { weight: number; status: string }[]
): number => {
  const total = tasks.reduce((sum, t) => sum + t.weight, 0);
  const completed = tasks
    .filter((t) => t.status === 'done' || t.status === 'partial')
    .reduce((sum, t) => sum + (t.status === 'done' ? t.weight : t.weight * 0.5), 0);
  return total > 0 ? (completed / total) * 100 : 0;
};

export const isEligibleForWeekly = (
  foundationDays: number,
  commitmentRate: number
): boolean => foundationDays >= 40 && commitmentRate >= 0.9;

export const calculateHealthScore = (params: {
  commitmentRate: number;
  balanceProgress: number; // 0-1
  hasDeficit: boolean;
  savingsRate: number; // 0-1
  debtBehavior: number; // 0-1
  balanceWithdrawals: number; // count in last 30 days
  allocationComplete: boolean;
}): number => {
  let score = 0;
  score += params.commitmentRate * 30;
  score += Math.min(params.balanceProgress, 1) * 20;
  score += params.hasDeficit ? 0 : 10;
  score += params.savingsRate * 15;
  score += params.debtBehavior * 15;
  score -= Math.min(params.balanceWithdrawals * 3, 15);
  score += params.allocationComplete ? 10 : 0;
  return Math.max(0, Math.min(100, Math.round(score)));
};
