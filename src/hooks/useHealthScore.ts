import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  addHealthScore,
  getLatestHealthScore,
  updateUserProfile,
} from '../firebase/firestore';
import { HealthScore } from '../types/health';
import { Task } from '../types/task';
import { FinancialCenter } from '../types/center';
import { calculateHealthScore } from '../utils/calculations';
import { getHealthLevel } from '../constants/healthLevels';
import { todayStr } from '../utils/dates';
import { balanceCenterMax } from '../utils/calculations';

interface ComputeArgs {
  tasks: Task[];
  centers: FinancialCenter[];
  income: number;
  withdrawals: number;
}

export const buildHealthScore = ({
  tasks,
  centers,
  income,
  withdrawals,
}: ComputeArgs): Omit<HealthScore, 'id' | 'createdAt'> => {
  const evaluated = tasks.filter((t) => t.status !== 'pending');
  const done = tasks.filter((t) => t.status === 'done').length;
  const partial = tasks.filter((t) => t.status === 'partial').length;
  const commitmentRate =
    evaluated.length > 0 ? (done + partial * 0.5) / evaluated.length : 0;

  const balance = centers.find((c) => c.key === 'balance');
  const max = balanceCenterMax(income);
  const balanceProgress = max > 0 && balance ? balance.currentBalance / max : 0;

  const expenses = centers.find((c) => c.key === 'expenses');
  const hasDeficit = expenses ? expenses.currentBalance < 0 : false;

  const savingsCenters = centers.filter((c) =>
    ['balance', 'readiness'].includes(c.key)
  );
  const savingsTotal = savingsCenters.reduce((s, c) => s + c.monthlyAmount, 0);
  const savingsRate = income > 0 ? Math.min(savingsTotal / income, 1) : 0;

  const debts = centers.find((c) => c.key === 'debts');
  const debtBehavior = debts && debts.monthlyAmount > 0 ? 0.8 : 0.5;

  const allocationComplete =
    Math.abs(centers.reduce((s, c) => s + c.percentage, 0) - 100) < 0.01;

  const score = calculateHealthScore({
    commitmentRate,
    balanceProgress,
    hasDeficit,
    savingsRate,
    debtBehavior,
    balanceWithdrawals: withdrawals,
    allocationComplete,
  });

  const level = getHealthLevel(score);

  const strengths: string[] = [];
  const improvements: string[] = [];
  const reasons: string[] = [];

  if (commitmentRate >= 0.8) strengths.push('التزام عالٍ بمهامك اليومية');
  else improvements.push('حاول رفع نسبة إنجاز المهام اليومية');

  if (balanceProgress >= 0.5) strengths.push('احتياطي التوازن في وضع جيد');
  else improvements.push('استمر في بناء مركز التوازن ليغطي 3 أشهر');

  if (!hasDeficit) strengths.push('لا يوجد عجز في المصاريف');
  else improvements.push('عالج العجز في مركز المصاريف');

  if (savingsRate >= 0.2) strengths.push('معدل ادخار جيد');
  else improvements.push('حاول زيادة ما تخصصه للادخار والاستعداد');

  if (withdrawals > 0)
    improvements.push(`قللت من سحوبات التوازن (${withdrawals} خلال آخر فترة)`);

  reasons.push(`نسبة الالتزام: ${Math.round(commitmentRate * 100)}%`);
  reasons.push(`تقدّم مركز التوازن: ${Math.round(balanceProgress * 100)}%`);
  reasons.push(`معدل الادخار: ${Math.round(savingsRate * 100)}%`);

  const recommendation =
    score < 36
      ? 'ركّز على تغطية المصاريف الأساسية وتقليل السحوبات قبل أي توسع.'
      : score < 66
      ? 'أنت في طريق التحسن، حافظ على الالتزام وزد من مركز التوازن تدريجيًا.'
      : 'وضعك جيد، فكّر في تعزيز مركز التوازن والاستعداد للفرص.';

  return {
    score,
    level: level.level,
    reasons,
    strengths,
    improvements,
    recommendation,
    date: todayStr(),
  };
};

export const useHealthScore = () => {
  const { user } = useAuth();
  const [latest, setLatest] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getLatestHealthScore(user.uid);
    setLatest(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const compute = useCallback(
    async (args: ComputeArgs) => {
      if (!user) return null;
      const built = buildHealthScore(args);
      await addHealthScore(user.uid, built);
      await updateUserProfile(user.uid, {
        healthScore: built.score,
        healthLevel: built.level,
        themeLevel: built.level,
      });
      const result: HealthScore = { id: 'latest', createdAt: new Date(), ...built };
      setLatest(result);
      return result;
    },
    [user]
  );

  return { latest, loading, refresh, compute };
};
