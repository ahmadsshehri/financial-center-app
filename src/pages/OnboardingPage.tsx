import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Check, Building2, Compass, AlertCircle } from 'lucide-react';
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

const TOTAL_STEPS = 7;

export const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [incomes, setIncomes] = useState<DraftIncome[]>([
    { name: 'الراتب', type: 'salary', amount: 0, isFixed: true },
  ]);
  const [centers, setCenters] = useState<DraftCenter[]>(
    DEFAULT_CENTERS.map((c) => ({ ...c, startingBalance: 0 }))
  );

  const income = useMemo(() => totalIncome(incomes), [incomes]);
  const allocationValid = useMemo(() => validateAllocation(centers), [centers]);
  const allocationTotal = useMemo(
    () => centers.reduce((s, c) => s + c.percentage, 0),
    [centers]
  );

  const updateIncome = (i: number, patch: Partial<DraftIncome>) =>
    setIncomes((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addIncome = () =>
    setIncomes((prev) => [
      ...prev,
      { name: '', type: 'other', amount: 0, isFixed: false },
    ]);
  const removeIncome = (i: number) =>
    setIncomes((prev) => prev.filter((_, idx) => idx !== i));

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

      // generate daily financial tasks for active money-moving centers
      const taskCenters = payloadCenters.filter((c) =>
        ['balance', 'charity', 'readiness', 'debts'].includes(c.key)
      );
      const tasks = dates.flatMap((date) =>
        taskCenters
          .filter((c) => c.dailyAmount > 0)
          .map((c) => ({
            title: `تحويل ${c.nameAr} اليومي`,
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

  const canNext = () => {
    if (step === 1) return income > 0;
    if (step === 2) return allocationValid;
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

        {step === 0 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Compass size={26} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">فلسفة المركز المالي</h2>
            <p className="text-sm leading-7 text-slate-600">
              بدلًا من تتبّع كل ريال في محافظ منفصلة، نوزّع دخلك على ستة مراكز تعكس
              أولوياتك: المصاريف، التوازن، الصدقة، الاستعداد، الديون، والفائض. كل مركز له
              معنى ووظيفة. خلال 40 يومًا الأولى نبني العادة بإيقاع يومي بسيط.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">مصادر الدخل</h2>
            <p className="text-sm text-slate-500">أضف رواتبك ومصادر دخلك الشهرية.</p>
            {incomes.map((inc, i) => (
              <Card key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    مصدر {i + 1}
                  </span>
                  {incomes.length > 1 && (
                    <button
                      onClick={() => removeIncome(i)}
                      className="text-red-500 hover:text-red-600"
                    >
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
                  onChange={(e) =>
                    updateIncome(i, { type: e.target.value as IncomeType })
                  }
                  options={Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
                <Input
                  label="المبلغ الشهري"
                  type="number"
                  value={inc.amount || ''}
                  onChange={(e) =>
                    updateIncome(i, { amount: Number(e.target.value) || 0 })
                  }
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

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">توزيع المراكز</h2>
            <p className="text-sm text-slate-500">
              عدّل النسب بحيث يكون المجموع 100%.
            </p>
            {centers.map((c) => (
              <Card key={c.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{c.nameAr}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={c.percentage}
                      onChange={(e) =>
                        updateCenterPct(c.key, Number(e.target.value) || 0)
                      }
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
            <Card
              className={
                allocationValid
                  ? 'border-green-200 bg-green-50'
                  : 'border-amber-200 bg-amber-50'
              }
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">المجموع</span>
                <span
                  className={`text-lg font-bold ${
                    allocationValid ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
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

        {step === 4 && (
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
                  onChange={(e) =>
                    updateCenterBalance(c.key, Number(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-left text-sm"
                  dir="ltr"
                />
              </Card>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Building2 size={26} />
            </div>
            <h2 className="text-center text-xl font-bold text-slate-900">
              توصية بنكية
            </h2>
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

        {step === 6 && (
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
                <Row label="عدد المراكز" value={`${centers.length}`} />
                <Row label="مدة الخطة" value="40 يومًا" />
              </div>
            </Card>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
            >
              السابق
            </Button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex-1"
            >
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
