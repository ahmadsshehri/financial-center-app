import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Lock, User as UserIcon, RefreshCw } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { useFinancialCenters } from '../hooks/useFinancialCenters';
import { logoutUser } from '../firebase/auth';
import { getIncomeSources, regenerateTasks } from '../firebase/firestore';
import { ROUTES } from '../constants/routes';
import { validateAllocation } from '../utils/validators';
import { centerMonthlyAmount, dailyAmount, totalIncome } from '../utils/calculations';
import { generate40DayDates } from '../utils/dates';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, update } = useUserData();
  const { centers, update: updateCenter } = useFinancialCenters();
  const [payday, setPayday] = useState('1');
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily');
  const [pcts, setPcts] = useState<Record<string, number>>({});
  const [savedMsg, setSavedMsg] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (profile) {
      setPayday(String(profile.payday ?? 1));
      setMode(profile.preferredMode);
    }
  }, [profile]);

  useEffect(() => {
    setPcts(Object.fromEntries(centers.map((c) => [c.id, c.percentage])));
  }, [centers]);

  const allocationList = centers.map((c) => ({ percentage: pcts[c.id] ?? c.percentage }));
  const allocationValid = validateAllocation(allocationList);

  const saveProfile = async () => {
    await update({ payday: Number(payday) || 1, preferredMode: mode });
    flash();
  };

  const saveAllocation = async () => {
    if (!allocationValid) return;
    for (const c of centers) {
      const pct = pcts[c.id];
      if (pct !== undefined && pct !== c.percentage) {
        await updateCenter(c.id, { percentage: pct });
      }
    }
    flash();
  };

  const flash = () => {
    setSavedMsg('تم الحفظ');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const logout = async () => {
    await logoutUser();
    navigate(ROUTES.WELCOME);
  };

  const handleRegenerateTasks = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      const sources = await getIncomeSources(user.uid);
      const income = totalIncome(sources);
      const dates = generate40DayDates(new Date());

      const centerTitles: Record<string, string> = {
        expenses: 'تحويل المصروف الشخصي',
        balance: 'تحويل التوازن اليومي',
        charity: 'تحويل الصدقة اليومية',
        readiness: 'تحويل الاستعداد اليومي',
        debts: 'تحويل الديون اليومي',
      };

      const taskCenters = centers.filter((c) =>
        ['expenses', 'balance', 'charity', 'readiness', 'debts'].includes(c.key)
      );

      const tasks = dates.flatMap((date) =>
        taskCenters
          .filter((c) => {
            const monthly = centerMonthlyAmount(income, c.percentage);
            return Math.round(dailyAmount(monthly, 30)) > 0;
          })
          .map((c) => {
            const monthly = centerMonthlyAmount(income, c.percentage);
            return {
              title: centerTitles[c.key] ?? `تحويل ${c.nameAr} اليومي`,
              centerKey: c.key,
              centerId: c.id,
              requiredAmount: Math.round(dailyAmount(monthly, 30)),
              date,
              frequency: 'daily',
              type: 'financial',
              weight: 1,
            };
          })
      );

      await regenerateTasks(user.uid, tasks);
      setSavedMsg('تم إعادة توليد خطة 40 يوم بنجاح');
      setTimeout(() => setSavedMsg(''), 3000);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <MainLayout title="الإعدادات">
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <UserIcon size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{profile?.displayName}</p>
              <p className="text-xs text-slate-500" dir="ltr">
                {profile?.email}
              </p>
            </div>
            <Badge className="mr-auto">
              {profile?.stage === 'foundation'
                ? 'مرحلة التأسيس'
                : profile?.stage === 'weekly'
                ? 'الإيقاع الأسبوعي'
                : 'النمو'}
            </Badge>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">تفضيلات المهام</h3>
          <Input
            label="يوم استلام الراتب (1-31)"
            type="number"
            min={1}
            max={31}
            value={payday}
            onChange={(e) => setPayday(e.target.value)}
            dir="ltr"
            className="text-left"
          />
          <Select
            label="نمط المهام"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'daily' | 'weekly')}
            options={[
              { value: 'daily', label: 'يومي' },
              { value: 'weekly', label: 'أسبوعي' },
            ]}
          />
          <Button fullWidth onClick={saveProfile}>
            حفظ التفضيلات
          </Button>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">توزيع المراكز</h3>
          {centers.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{c.nameAr}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={pcts[c.id] ?? c.percentage}
                  onChange={(e) =>
                    setPcts({ ...pcts, [c.id]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-left text-sm"
                  dir="ltr"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">المجموع</span>
            <span
              className={allocationValid ? 'font-semibold text-green-700' : 'font-semibold text-amber-700'}
            >
              {allocationList.reduce((s, c) => s + c.percentage, 0)}%
            </span>
          </div>
          <Button fullWidth onClick={saveAllocation} disabled={!allocationValid}>
            حفظ التوزيع
          </Button>
        </Card>

        {savedMsg && (
          <p className="text-center text-sm font-medium text-green-700">{savedMsg}</p>
        )}

        <Card className="flex items-start gap-3 bg-slate-50">
          <Lock size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <p className="text-xs leading-6 text-slate-600">
            بياناتك المالية مخزّنة في حسابك الخاص فقط ومحمية بقواعد وصول صارمة. لا يطّلع
            عليها أحد سواك.
          </p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">خطة التأسيس</h3>
          <p className="text-xs text-slate-500 leading-6">
            إعادة توليد مهام خطة الـ 40 يوم من اليوم الحالي. سيتم حذف المهام المعلقة
            واستبدالها بمهام جديدة تشمل تحويل المصروف الشخصي.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleRegenerateTasks}
            disabled={regenerating}
          >
            <RefreshCw size={15} />
            {regenerating ? 'جارٍ إعادة التوليد...' : 'إعادة توليد خطة 40 يوم'}
          </Button>
        </Card>

        <Button variant="danger" fullWidth onClick={logout}>
          <LogOut size={16} /> تسجيل الخروج
        </Button>
      </div>
    </MainLayout>
  );
};
