import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Wallet, ListChecks, TrendingUp, ChevronLeft, Plus, ArrowLeft } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { useFinancialCenters } from '../hooks/useFinancialCenters';
import { useTasks } from '../hooks/useTasks';
import { getIncomeSources } from '../firebase/firestore';
import { totalIncome, foundationProgress } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { getHealthLevel } from '../constants/healthLevels';
import { ROUTES } from '../constants/routes';

type ModalStep = 'input' | 'suggest' | null;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserData();
  const { centers, update: updateCenter } = useFinancialCenters();
  const { tasks, todayTasks } = useTasks();
  const [income, setIncome] = useState(0);

  // one-time income modal state
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [otiAmount, setOtiAmount] = useState('');
  const [otiLabel, setOtiLabel] = useState('');
  // per-center custom amounts for manual allocation
  const [centerAmounts, setCenterAmounts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    getIncomeSources(user.uid).then((s) => setIncome(totalIncome(s)));
  }, [user]);

  useEffect(() => {
    if (profileLoading) return;
    if (!profile || !profile.onboardingCompleted) navigate(ROUTES.ONBOARDING);
  }, [profile, profileLoading, navigate]);

  const level = getHealthLevel(profile?.healthScore ?? 0);
  const planProgress = useMemo(() => foundationProgress(tasks), [tasks]);
  const doneToday = todayTasks.filter((t) => t.status === 'done').length;

  const recommendation = useMemo(() => {
    const score = profile?.healthScore ?? 0;
    if (score < 36) return 'ابدأ بتغطية المصاريف الأساسية والالتزام بمهام اليوم لرفع مؤشرك.';
    if (score < 66) return 'أنت تتقدم، حافظ على الالتزام وادعم مركز التوازن.';
    return 'وضعك جيد، فكّر بتعزيز الاستعداد والتوازن للفرص القادمة.';
  }, [profile]);

  const amount = parseFloat(otiAmount) || 0;

  // distribution by percentages
  const distribution = useMemo(() => {
    if (!amount || centers.length === 0) return [];
    const total = centers.reduce((s, c) => s + c.percentage, 0);
    return centers.map((c) => ({
      center: c,
      share: Math.round((c.percentage / total) * amount),
    }));
  }, [amount, centers]);

  // manual allocation totals
  const manualTotal = useMemo(
    () => Object.values(centerAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0),
    [centerAmounts]
  );
  const remaining = Math.round((amount - manualTotal) * 100) / 100;
  const manualValid = manualTotal > 0 && remaining >= 0;

  const openModal = () => {
    setOtiAmount('');
    setOtiLabel('');
    setCenterAmounts({});
    setDoneMsg('');
    setModalStep('input');
  };

  const closeModal = () => setModalStep(null);

  const applyDistribution = async () => {
    setSaving(true);
    for (const { center, share } of distribution) {
      if (share > 0) {
        await updateCenter(center.id, { currentBalance: center.currentBalance + share });
      }
    }
    setSaving(false);
    setDoneMsg(`تم توزيع ${formatCurrency(amount)} على المراكز بنجاح ✓`);
    setModalStep(null);
  };

  const applyManual = async () => {
    if (!manualValid) return;
    setSaving(true);
    for (const c of centers) {
      const val = parseFloat(centerAmounts[c.id] || '0') || 0;
      if (val > 0) {
        await updateCenter(c.id, { currentBalance: c.currentBalance + val });
      }
    }
    setSaving(false);
    setDoneMsg(`تم تحويل ${formatCurrency(manualTotal)} للمراكز المحددة ✓`);
    setModalStep(null);
  };

  if (profileLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
    </div>
  );
  if (!profile || !profile.onboardingCompleted) return null;

  return (
    <MainLayout title="المركز المالي" subtitle={profile?.displayName}>
      <div className="space-y-4">
        <Card className="border-0" onClick={() => navigate(ROUTES.ANALYSIS)}>
          <div className="flex items-center justify-between rounded-xl p-1" style={{ color: level.color }}>
            <div>
              <p className="text-xs text-slate-500">مؤشر الصحة المالية</p>
              <p className="text-3xl font-bold">{profile?.healthScore ?? 0}</p>
              <Badge bgColor={level.bgColor} color={level.color} className="mt-1">{level.label}</Badge>
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
                <p className="text-lg font-bold text-slate-900">{formatCurrency(income)}</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </div>
        </Card>

        {/* one-time income quick action */}
        <button
          onClick={openModal}
          className="w-full flex items-center gap-3 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <Plus size={18} className="text-blue-600" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">إضافتك اليوم للدخل</p>
            <p className="text-xs text-blue-500">عمولة، بيع، مكافأة...</p>
          </div>
        </button>

        {doneMsg && (
          <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-center text-sm font-medium text-green-700">
            {doneMsg}
          </p>
        )}

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
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(c.currentBalance)}</p>
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
            <Badge>{doneToday}/{todayTasks.length}</Badge>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد مهام لهذا اليوم.</p>
          ) : (
            <ul className="space-y-1.5">
              {todayTasks.slice(0, 3).map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm text-slate-700">
                  <span>{t.title}</span>
                  <span className="text-xs text-slate-400">{formatCurrency(t.requiredAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">تقدّم خطة 40 يومًا</h3>
            <span className="text-sm font-semibold text-slate-700">{Math.round(planProgress)}%</span>
          </div>
          <ProgressBar value={planProgress} />
        </Card>

        <Card className="bg-slate-900 text-white">
          <p className="mb-1 text-xs text-slate-300">توصية ذكية</p>
          <p className="text-sm leading-7">{recommendation}</p>
        </Card>
      </div>

      {/* Step 1: Enter amount */}
      <Modal open={modalStep === 'input'} onClose={closeModal} title="إضافتك اليوم للدخل">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 leading-6">
            عمولة، بيع، هدية أو أي دخل لمرة واحدة. أدخل المبلغ وسنقترح لك أفضل طريقة للتعامل معه.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">المبلغ (ر.س)</label>
            <input
              type="number"
              min={1}
              value={otiAmount}
              onChange={(e) => setOtiAmount(e.target.value)}
              placeholder="مثال: 2000"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-left text-base focus:border-blue-500 focus:outline-none"
              dir="ltr"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">وصف (اختياري)</label>
            <input
              type="text"
              value={otiLabel}
              onChange={(e) => setOtiLabel(e.target.value)}
              placeholder="مثال: عمولة مبيعات"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              if (amount > 0) {
                setCenterAmounts({});
                setModalStep('suggest');
              }
            }}
            disabled={amount <= 0}
            className="w-full rounded-xl bg-blue-700 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      </Modal>

      {/* Step 2: Choose distribution method */}
      <Modal open={modalStep === 'suggest'} onClose={closeModal} title="كيف تريد التعامل مع هذا المبلغ؟">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            {otiLabel ? `"${otiLabel}" — ` : ''}{formatCurrency(amount)}
          </p>

          {/* Option A: distribute by percentages */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">١</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">وزّع بنفس نسب مراكزك</p>
                <p className="text-xs text-slate-500 leading-5">يُوزَّع المبلغ فوراً على مراكزك بنفس النسب المعتمدة</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {distribution.map(({ center, share }) => (
                <div key={center.id} className="flex items-center justify-between text-xs text-slate-600">
                  <span>{center.nameAr}</span>
                  <span className="font-medium text-slate-800">{formatCurrency(share)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={applyDistribution}
              disabled={saving}
              className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? 'جارٍ التوزيع...' : 'وزّع الآن'}
            </button>
          </div>

          {/* Option B: manual per-center amounts */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold">٢</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">حوّل لمركز أو أكثر بمبالغ مخصصة</p>
                <p className="text-xs text-slate-500 leading-5">أدخل المبلغ لكل مركز تريده — ما تتركه فارغاً يُهمَل</p>
              </div>
            </div>

            <div className="space-y-2">
              {centers.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-slate-700">{c.nameAr}</span>
                  <input
                    type="number"
                    min={0}
                    value={centerAmounts[c.id] ?? ''}
                    onChange={(e) =>
                      setCenterAmounts((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    placeholder="0"
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-left text-sm focus:border-blue-500 focus:outline-none"
                    dir="ltr"
                  />
                  <span className="text-xs text-slate-400">ر.س</span>
                </div>
              ))}
            </div>

            {/* remaining indicator */}
            <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
              remaining < 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'
            }`}>
              <span>المتبقي</span>
              <span>{formatCurrency(remaining < 0 ? 0 : remaining)}{remaining < 0 ? ' — تجاوزت المبلغ' : ''}</span>
            </div>

            <button
              onClick={applyManual}
              disabled={!manualValid || saving}
              className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              {saving ? 'جارٍ الحفظ...' : `حوّل ${formatCurrency(manualTotal)}`}
            </button>
          </div>

          <button
            onClick={() => setModalStep('input')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft size={12} /> تعديل المبلغ
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
};
