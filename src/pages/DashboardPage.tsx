import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Wallet, ListChecks, TrendingUp, ChevronLeft } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { useFinancialCenters } from '../hooks/useFinancialCenters';
import { useTasks } from '../hooks/useTasks';
import { getIncomeSources } from '../firebase/firestore';
import { totalIncome, foundationProgress } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { getHealthLevel } from '../constants/healthLevels';
import { ROUTES } from '../constants/routes';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserData();
  const { centers } = useFinancialCenters();
  const { tasks, todayTasks } = useTasks();
  const [income, setIncome] = useState(0);

  useEffect(() => {
    if (!user) return;
    getIncomeSources(user.uid).then((s) => setIncome(totalIncome(s)));
  }, [user]);

  const onboarded = profile?.onboardingCompleted;
  useEffect(() => {
    if (profileLoading) return;
    if (!profile || !profile.onboardingCompleted) navigate(ROUTES.ONBOARDING);
  }, [profile, profileLoading, navigate]);

  const level = getHealthLevel(profile?.healthScore ?? 0);
  const planProgress = useMemo(() => foundationProgress(tasks), [tasks]);
  const doneToday = todayTasks.filter((t) => t.status === 'done').length;

  const recommendation = useMemo(() => {
    const score = profile?.healthScore ?? 0;
    if (score < 36)
      return 'ابدأ بتغطية المصاريف الأساسية والالتزام بمهام اليوم لرفع مؤشرك.';
    if (score < 66) return 'أنت تتقدم، حافظ على الالتزام وادعم مركز التوازن.';
    return 'وضعك جيد، فكّر بتوجيه الفائض نحو الاستعداد للفرص.';
  }, [profile]);

  if (profileLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
    </div>
  );
  // No profile doc or onboarding not done → redirect to onboarding
  if (!profile || !profile.onboardingCompleted) {
    return null;
  }

  return (
    <MainLayout title="المركز المالي" subtitle={profile?.displayName}>
      <div className="space-y-4">
        <Card
          className="border-0"
          onClick={() => navigate(ROUTES.ANALYSIS)}
        >
          <div
            className="flex items-center justify-between rounded-xl p-1"
            style={{ color: level.color }}
          >
            <div>
              <p className="text-xs text-slate-500">مؤشر الصحة المالية</p>
              <p className="text-3xl font-bold">{profile?.healthScore ?? 0}</p>
              <Badge bgColor={level.bgColor} color={level.color} className="mt-1">
                {level.label}
              </Badge>
            </div>
            <Activity size={40} strokeWidth={1.6} />
          </div>
        </Card>

        <Card onClick={() => navigate(ROUTES.INCOME)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500">إجمالي الدخل الشهري</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(income)}
                </p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </div>
        </Card>

        <Card onClick={() => navigate(ROUTES.CENTERS)}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-slate-700" />
              <h3 className="font-semibold text-slate-800">المراكز المالية</h3>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {centers.map((c) => (
              <div key={c.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">{c.nameAr}</p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatCurrency(c.currentBalance)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card onClick={() => navigate(ROUTES.TASKS)}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-slate-700" />
              <h3 className="font-semibold text-slate-800">مهام اليوم</h3>
            </div>
            <Badge>
              {doneToday}/{todayTasks.length}
            </Badge>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد مهام لهذا اليوم.</p>
          ) : (
            <ul className="space-y-1.5">
              {todayTasks.slice(0, 3).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>{t.title}</span>
                  <span className="text-xs text-slate-400">
                    {formatCurrency(t.requiredAmount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">تقدّم خطة 40 يومًا</h3>
            <span className="text-sm font-semibold text-slate-700">
              {Math.round(planProgress)}%
            </span>
          </div>
          <ProgressBar value={planProgress} />
        </Card>

        <Card className="bg-slate-900 text-white">
          <p className="mb-1 text-xs text-slate-300">توصية ذكية</p>
          <p className="text-sm leading-7">{recommendation}</p>
        </Card>
      </div>
    </MainLayout>
  );
};
