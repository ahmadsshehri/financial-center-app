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
import { FinancialCenter } from '../types/center';

type ModalStep = 'input' | 'suggest' | 'pick-center' | null;

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
  const [selectedCenter, setSelectedCenter] = useState<FinancialCenter | null>(null);
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

  // distribution breakdown by current center percentages
  const distribution = useMemo(() => {
    if (!amount || centers.length === 0) return [];
    const total = centers.reduce((s, c) => s + c.percentage, 0);
    return centers.map((c) => ({
      center: c,
      share: Math.round((c.percentage / total) * amount),
    }));
  }, [amount, centers]);

  const openModal = () => {
    setOtiAmount('');
    setOtiLabel('');
    setSelectedCenter(null);
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

  const applyToCenter = async () => {
    if (!selectedCenter) return;
    setSaving(true);
    await updateCenter(selectedCenter.id, {
      currentBalance: selectedCenter.currentBalance + amount,
    });
    setSaving(false);
    setDoneMsg(`تم إضافة ${formatCurrency(amount)} إلى ${selectedCenter.nameAr} ✓`);
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
            <p className="text-sm font-semibold">دخل غير متكرر</p>
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
      <Modal open={modalStep === 'input'} onClose={closeModal} title="دخل غير متكرر">
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
            onClick={() => amount > 0 && setModalStep('suggest')}
            disabled={amount <= 0}
            className="w-full rounded-xl bg-blue-700 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      </Modal>

      {/* Step 2: Suggest how to distribute */}
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

          {/* Option B: pick one center */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold">٢</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">حوّل كله لمركز واحد</p>
                <p className="text-xs text-slate-500 leading-5">اختر المركز الذي تريد رفع رصيده بالكامل</p>
              </div>
            </div>
            {modalStep === 'suggest' && (
              <div className="grid grid-cols-2 gap-2">
                {centers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCenter(selectedCenter?.id === c.id ? null : c)}
                    className={`rounded-lg border px-3 py-2 text-right text-xs font-medium transition ${
                      selectedCenter?.id === c.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.nameAr}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={applyToCenter}
              disabled={!selectedCenter || saving}
              className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              {saving ? 'جارٍ الحفظ...' : selectedCenter ? `حوّل لـ ${selectedCenter.nameAr}` : 'اختر مركزاً'}
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
