import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Check, Building2, Compass, AlertCircle, HeartPulse } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { completeOnboarding, addIncomeSource } from '../firebase/firestore';
import { DEFAULT_CENTERS } from '../constants/defaultCenters';
import { INCOME_TYPE_LABELS, IncomeType } from '../types/income';
import { ROUTES } from '../constants/routes';
import { validateAllocation } from '../utils/validators';
import {
  centerMonthlyAmount,
  dailyAmount,
  totalIncome,
} from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generate40DayDates } from '../utils/dates';

interface DraftIncome {
  name: string;
  type: IncomeType;
  amount: number;
  isFixed: boolean;
}

interface DraftCenter {
  key: string;
  nameAr: string;
  descriptionAr: string;
  percentage: number;
  order: number;
  startingBalance: number;
}

interface Obligation {
  id: number;
  label: string;
  amount: number;
}

let _obId = 5;
const newObId = () => ++_obId;

const INITIAL_OBLIGATIONS: Obligation[] = [
  { id: 1, label: 'الإيجار',           amount: 0 },
  { id: 2, label: 'المواصلات',          amount: 0 },
  { id: 3, label: 'الديون والأقساط',   amount: 0 },
  { id: 4, label: 'الفواتير الثابتة',  amount: 0 },
  { id: 5, label: 'التزامات أخرى',     amount: 0 },
];

function calcHealthScore(obligationRatio: number) {
  if (obligationRatio <= 0.3)  return { score: 90, label: 'ممتاز',        color: 'text-green-700',  bar: 'bg-green-500',  bg: 'bg-green-50',  border: 'border-green-200' };
  if (obligationRatio <= 0.5)  return { score: 70, label: 'جيد',           color: 'text-blue-700',   bar: 'bg-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200' };
  if (obligationRatio <= 0.7)  return { score: 50, label: 'متوسط',         color: 'text-amber-700',  bar: 'bg-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' };
  return                               { score: 30, label: 'يحتاج تحسين',  color: 'text-red-700',    bar: 'bg-red-500',    bg: 'bg-red-50',    border: 'border-red-200' };
}

function suggestedAllocation(ratio: number): Record<string, number> {
  if (ratio <= 0.3) return { expenses: 42.5, balance: 22.5, charity: 5,   readiness: 10, debts: 20   };
  if (ratio <= 0.5) return { expenses: 45,   balance: 17.5, charity: 2.5, readiness: 7.5, debts: 27.5 };
  if (ratio <= 0.7) return { expenses: 50,   balance: 12.5, charity: 2,   readiness: 5,  debts: 30.5 };
  return                   { expenses: 55,   balance: 7.5,  charity: 1,   readiness: 3,  debts: 33.5 };
}

const TOTAL_STEPS = 8;

export const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [incomes, setIncomes] = useState<DraftIncome[]>([
    { name: 'الراتب', type: 'salary', amount: 0, isFixed: true },
  ]);
  const [obligations, setObligations] = useState<Obligation[]>(INITIAL_OBLIGATIONS);
  const [centers, setCenters] = useState<DraftCenter[]>(
    DEFAULT_CENTERS.map((c) => ({ ...c, startingBalance: 0 }))
  );

  const income = useMemo(() => totalIncome(incomes), [incomes]);
  const totalObligations = useMemo(
    () => obligations.reduce((s, o) => s + o.amount, 0),
    [obligations]
  );
  const obligationRatio = income > 0 ? totalObligations / income : 0;
  const health = calcHealthScore(obligationRatio);

  const allocationValid = useMemo(() => validateAllocation(centers), [centers]);
  const allocationTotal = useMemo(
    () => centers.reduce((s, c) => s + c.percentage, 0),
    [centers]
  );

  const updateIncome = (i: number, patch: Partial<DraftIncome>) =>
    setIncomes((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addIncome = () =>
    setIncomes((prev) => [...prev, { name: '', type: 'other', amount: 0, isFixed: false }]);
  const removeIncome = (i: number) =>
    setIncomes((prev) => prev.filter((_, idx) => idx !== i));

  const updateObligation = (id: number, patch: Partial<Obligation>) =>
    setObligations((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const addObligation = () =>
    setObligations((prev) => [...prev, { id: newObId(), label: '', amount: 0 }]);
  const removeObligation = (id: number) =>
    setObligations((prev) => prev.filter((o) => o.id !== id));

  const applyHealthAllocation = () => {
    const suggested = suggestedAllocation(obligationRatio);
    setCenters((prev) =>
      prev.map((c) =>
        suggested[c.key] !== undefined ? { ...c, percentage: suggested[c.key] } : c
      )
    );
  };

  const updateCenterPct = (key: string, pct: number) =>
    setCenters((prev) =>
      prev.map((c) => (c.key === key ? { ...c, percentage: pct } : c))
    );
  const updateCenterBalance = (key: string, bal: number) =>
    setCenters((prev) =>
      prev.map((c) => (c.key === key ? { ...c, startingBalance: bal } : c))
    );

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      for (const inc of incomes.filter((i) => i.amount > 0)) {
        await addIncomeSource(user.uid, {
          name: inc.name || 'مصدر دخل',
          type: inc.type,
          amount: inc.amount,
          isFixed: inc.isFixed,
        });
      }

      const startDate = new Date();
      const dates = generate40DayDates(startDate);

      const payloadCenters = centers.map((c) => {
        const monthly = centerMonthlyAmount(income, c.percentage);
        return {
          key: c.key,
          nameAr: c.nameAr,
          descriptionAr: c.descriptionAr,
          percentage: c.percentage,
          monthlyAmount: monthly,
          dailyAmount: dailyAmount(monthly, 30),
          currentBalance: c.startingBalance,
          order: c.order,
        };
      });

      const taskCenters = payloadCenters.filter((c) =>
        ['expenses', 'balance', 'charity', 'readiness', 'debts'].includes(c.key)
      );
      const centerTitles: Record<string, string> = {
        expenses: 'تحويل المصروف الشخصي',
        balance: 'تحويل التوازن اليومي',
        charity: 'تحويل الصدقة اليومية',
        readiness: 'تحويل الاستعداد اليومي',
        debts: 'تحويل الديون اليومي',
      };
      const tasks = dates.flatMap((date) =>
        taskCenters
          .filter((c) => c.dailyAmount > 0)
          .map((c) => ({
            title: centerTitles[c.key] ?? `تحويل ${c.nameAr} اليومي`,
            centerKey: c.key,
            requiredAmount: Math.round(c.dailyAmount),
            date,
            frequency: 'daily',
            type: 'financial',
            weight: 1,
          }))
      );

      await completeOnboarding(user.uid, {
        centers: payloadCenters,
        tasks,
        planStartDate: dates[0],
      });

      navigate(ROUTES.DASHBOARD);
    } catch {
      setSaving(false);
    }
  };

  const handleNext = () => {
    // When leaving the obligations step, pre-fill allocation based on health score
    if (step === 2) applyHealthAllocation();
    setStep((s) => s + 1);
  };

  const canNext = () => {
    if (step === 1) return income > 0;
    if (step === 4) return allocationValid;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-6 py-8">
        <div className="mb-6">
          <p className="mb-2 text-xs text-slate-500">
            الخطوة {step + 1} من {TOTAL_STEPS}
          </p>
          <ProgressBar value={((step + 1) / TOTAL_STEPS) * 100} />
        </div>

        {/* Step 1: Philosophy */}
        {step === 0 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Compass size={26} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">فلسفة المركز المالي</h2>
            <p className="text-sm leading-7 text-slate-600">
              يقولون في علم النفس: أي شيء تركّز عليه يزيد. احنا هنا نركّز على الدخل عشان
              يزيد. خلال 40 يوم بنبني فيها عادة مالية قوية في إدارة الدخل، وبتعرف صحتك
              المالية. لا تشيل هم، التطبيق بيتابع معك المهام خطوة بخطوة.
            </p>
          </div>
        )}

        {/* Step 2: Income */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">مصادر الدخل</h2>
            <p className="text-sm text-slate-500">أضف رواتبك ومصادر دخلك الشهرية.</p>
            {incomes.map((inc, i) => (
              <Card key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">مصدر {i + 1}</span>
                  {incomes.length > 1 && (
                    <button onClick={() => removeIncome(i)} className="text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <Input
                  label="الاسم"
                  value={inc.name}
                  onChange={(e) => updateIncome(i, { name: e.target.value })}
                  placeholder="مثال: راتب الوظيفة"
                />
                <Select
                  label="النوع"
                  value={inc.type}
                  onChange={(e) => updateIncome(i, { type: e.target.value as IncomeType })}
                  options={Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                />
                <Input
                  label="المبلغ الشهري"
                  type="number"
                  value={inc.amount || ''}
                  onChange={(e) => updateIncome(i, { amount: Number(e.target.value) || 0 })}
                  placeholder="0"
                />
              </Card>
            ))}
            <Button variant="secondary" fullWidth onClick={addIncome}>
              <Plus size={16} /> إضافة مصدر دخل
            </Button>
            <Card className="bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm">إجمالي الدخل الشهري</span>
                <span className="text-lg font-bold">{formatCurrency(income)}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Obligations + Health Score */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">التزاماتك الشهرية</h2>
              <p className="text-sm text-slate-500">
                أدخل مبالغ تقريبية — لا يلزم الدقة. هدفنا نفهم وضعك المالي ونقترح توزيعًا مناسبًا.
              </p>
            </div>

            {obligations.map((o, i) => (
              <Card key={o.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">التزام {i + 1}</span>
                  {obligations.length > 1 && (
                    <button onClick={() => removeObligation(o.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={o.label}
                  onChange={(e) => updateObligation(o.id, { label: e.target.value })}
                  placeholder="اسم الالتزام — مثال: إيجار، راتب سائق، مدرسة"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-sm"
                />
                <input
                  type="number"
                  value={o.amount || ''}
                  onChange={(e) => updateObligation(o.id, { amount: Number(e.target.value) || 0 })}
                  placeholder="المبلغ الشهري التقريبي"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm"
                  dir="ltr"
                />
              </Card>
            ))}
            <Button variant="secondary" fullWidth onClick={addObligation}>
              <Plus size={16} /> إضافة التزام
            </Button>

            {/* Health score indicator */}
            {income > 0 && (
              <Card className={`space-y-3 border ${health.border} ${health.bg}`}>
                <div className="flex items-center gap-2">
                  <HeartPulse size={18} className={health.color} />
                  <span className="text-sm font-semibold text-slate-800">مؤشر صحتك المالية</span>
                  <span className={`mr-auto text-base font-bold ${health.color}`}>{health.label}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${health.bar}`}
                    style={{ width: `${health.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>الالتزامات: {formatCurrency(totalObligations)} شهريًا</span>
                  <span>نسبة: {Math.round(obligationRatio * 100)}% من الدخل</span>
                </div>
                <p className="text-xs leading-5 text-slate-600">
                  {obligationRatio <= 0.3 && 'وضعك ممتاز! التزاماتك أقل من 30% من دخلك — هذا يتيح لك مرونة كبيرة في التوفير والاستثمار.'}
                  {obligationRatio > 0.3 && obligationRatio <= 0.5 && 'وضعك جيد. التزاماتك بين 30-50% من دخلك — بإمكانك البناء بشكل مريح مع انتباه لتقليل الديون.'}
                  {obligationRatio > 0.5 && obligationRatio <= 0.7 && 'وضعك متوسط. التزاماتك بين 50-70% من دخلك — ننصح بالتركيز على تقليل الديون بشكل أسرع.'}
                  {obligationRatio > 0.7 && 'التزاماتك مرتفعة نسبيًا. بنبني خطة تساعدك تخفّف الضغط تدريجيًا وتحسّن وضعك المالي.'}
                </p>
              </Card>
            )}

            {income === 0 && (
              <Card className="border-slate-200 bg-slate-100">
                <p className="text-center text-xs text-slate-500">
                  أدخل دخلك في الخطوة السابقة لرؤية مؤشر الصحة المالية
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Center Explanations */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">شرح المراكز</h2>
            {centers.map((c) => (
              <Card key={c.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{c.nameAr}</span>
                  <span className="text-xs text-slate-400">{c.percentage}%</span>
                </div>
                <p className="text-xs leading-6 text-slate-600">{c.descriptionAr}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Step 5: Allocation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">توزيع المراكز</h2>
              <p className="text-sm text-slate-500">
                اقترحنا لك نسبًا بناءً على وضعك المالي. عدّلها كما تشاء بحيث يكون المجموع 100%.
              </p>
            </div>
            <Card className={`border ${health.border} ${health.bg}`}>
              <div className="flex items-center gap-2">
                <HeartPulse size={16} className={health.color} />
                <span className={`text-sm font-semibold ${health.color}`}>
                  مؤشر صحتك: {health.label} — النسب محسوبة تلقائيًا
                </span>
              </div>
            </Card>
            {centers.map((c) => (
              <Card key={c.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{c.nameAr}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={c.percentage}
                      onChange={(e) => updateCenterPct(c.key, parseFloat(e.target.value) || 0)}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-left text-sm"
                      dir="ltr"
                    />
                    <span className="text-sm text-slate-500">%</span>
                  </div>
                </div>
                {income > 0 && (
                  <p className="text-xs text-slate-500">
                    {formatCurrency(centerMonthlyAmount(income, c.percentage))} شهريًا
                  </p>
                )}
              </Card>
            ))}
            <Card className={allocationValid ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">المجموع</span>
                <span className={`text-lg font-bold ${allocationValid ? 'text-green-700' : 'text-amber-700'}`}>
                  {allocationTotal}%
                </span>
              </div>
              {!allocationValid && (
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                  <AlertCircle size={13} /> يجب أن يكون المجموع 100%
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Step 6: Starting Balances */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">الأرصدة الابتدائية</h2>
            <p className="text-sm text-slate-500">
              اختياري: إن كان لديك رصيد حالي في أي مركز، أدخله الآن.
            </p>
            {centers.map((c) => (
              <Card key={c.key} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">{c.nameAr}</span>
                <input
                  type="number"
                  value={c.startingBalance || ''}
                  onChange={(e) => updateCenterBalance(c.key, Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-left text-sm"
                  dir="ltr"
                />
              </Card>
            ))}
          </div>
        )}

        {/* Step 7: Bank Recommendation */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Building2 size={26} />
            </div>
            <h2 className="text-center text-xl font-bold text-slate-900">توصية بنكية</h2>
            <Card className="space-y-3">
              <p className="text-sm leading-7 text-slate-600">
                لتسهيل الالتزام، ننصح بفتح حساب توفير منفصل لمركز التوازن، وآخر للديون إن
                أمكن. تحويل المبالغ اليومية أو الأسبوعية إلى حسابات مستقلة يقلّل من
                احتمال صرفها بالخطأ ويجعل تقدّمك ملموسًا.
              </p>
              <p className="text-xs leading-6 text-slate-500">
                هذه مجرد توصية تنظيمية، والتطبيق يعمل بغض النظر عن عدد حساباتك البنكية.
              </p>
            </Card>
          </div>
        )}

        {/* Step 8: Ready */}
        {step === 7 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <Check size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">جاهز للانطلاق</h2>
            <p className="text-sm leading-7 text-slate-600">
              سننشئ الآن مراكزك الستة وخطة 40 يومًا من المهام اليومية. يمكنك تعديل كل شيء
              لاحقًا من الإعدادات.
            </p>
            <Card className="text-right">
              <div className="space-y-2 text-sm">
                <Row label="الدخل الشهري" value={formatCurrency(income)} />
                <Row label="الالتزامات" value={formatCurrency(totalObligations)} />
                <Row label="مؤشر الصحة" value={health.label} />
                <Row label="عدد المراكز" value={`${centers.length}`} />
                <Row label="مدة الخطة" value="40 يومًا" />
              </div>
            </Card>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)} className="flex-1">
              السابق
            </Button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={handleNext} disabled={!canNext()} className="flex-1">
              التالي
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="flex-1">
              {saving ? 'جارٍ الإنشاء...' : 'إنشاء خطة 40 يومًا'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-800">{value}</span>
  </div>
);
