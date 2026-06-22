import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, ArrowUpCircle } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { useFinancialCenters } from '../hooks/useFinancialCenters';
import { useTasks } from '../hooks/useTasks';
import { useHealthScore } from '../hooks/useHealthScore';
import { getIncomeSources, getWithdrawals } from '../firebase/firestore';
import { totalIncome } from '../utils/calculations';
import { getHealthLevel } from '../constants/healthLevels';

export const AnalysisPage = () => {
  const { user } = useAuth();
  const { centers } = useFinancialCenters();
  const { tasks } = useTasks();
  const { latest, compute } = useHealthScore();
  const [income, setIncome] = useState(0);
  const [withdrawals, setWithdrawals] = useState(0);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    if (!user) return;
    getIncomeSources(user.uid).then((s) => setIncome(totalIncome(s)));
    getWithdrawals(user.uid).then((w) => setWithdrawals(w.length));
  }, [user]);

  const recompute = async () => {
    setComputing(true);
    await compute({ tasks, centers, income, withdrawals });
    setComputing(false);
  };

  const score = latest?.score ?? 0;
  const level = getHealthLevel(score);

  return (
    <MainLayout
      title="التحليل المالي"
      action={
        <Button onClick={recompute} disabled={computing} className="px-3 py-2">
          <RefreshCw size={15} className={computing ? 'animate-spin' : ''} />
          تحديث
        </Button>
      }
    >
      {!latest ? (
        <Card className="text-center">
          <p className="mb-4 py-4 text-sm text-slate-500">
            لم يُحسب مؤشر الصحة بعد. اضغط تحديث لحساب مؤشرك بناءً على نشاطك الحالي.
          </p>
          <Button fullWidth onClick={recompute} disabled={computing}>
            {computing ? 'جارٍ الحساب...' : 'احسب مؤشر الصحة'}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="text-center">
            <p className="text-xs text-slate-500">مؤشر الصحة المالية</p>
            <p className="my-1 text-5xl font-bold" style={{ color: level.color }}>
              {score}
            </p>
            <Badge bgColor={level.bgColor} color={level.color}>
              المستوى {level.level} · {level.label}
            </Badge>
            <p className="mt-3 text-xs leading-6 text-slate-500">{level.description}</p>
            <div className="mt-3">
              <ProgressBar value={score} color={level.color} />
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">الأسباب</h3>
            <ul className="space-y-1.5">
              {latest.reasons.map((r, i) => (
                <li key={i} className="text-sm text-slate-600">
                  • {r}
                </li>
              ))}
            </ul>
          </Card>

          {latest.strengths.length > 0 && (
            <Card>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <CheckCircle2 size={16} /> نقاط القوة
              </h3>
              <ul className="space-y-1.5">
                {latest.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600">
                    • {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {latest.improvements.length > 0 && (
            <Card>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <ArrowUpCircle size={16} /> فرص التحسين
              </h3>
              <ul className="space-y-1.5">
                {latest.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600">
                    • {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="bg-slate-900 text-white">
            <p className="mb-1 text-xs text-slate-300">التوصية</p>
            <p className="text-sm leading-7">{latest.recommendation}</p>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};
