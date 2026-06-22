import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useFinancialCenters } from '../hooks/useFinancialCenters';
import { formatCurrency } from '../utils/formatters';

export const CentersPage = () => {
  const { centers, loading } = useFinancialCenters();

  return (
    <MainLayout title="المراكز المالية" subtitle="ستة مراكز توجّه مالك">
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">جارٍ التحميل...</p>
      ) : (
        <div className="space-y-3">
          {centers.map((c) => (
            <Card key={c.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{c.nameAr}</h3>
                <Badge>{c.percentage}%</Badge>
              </div>
              <p className="text-xs leading-6 text-slate-500">{c.descriptionAr}</p>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                <Metric label="شهري" value={formatCurrency(c.monthlyAmount)} />
                <Metric label="يومي" value={formatCurrency(c.dailyAmount)} />
                <Metric label="الرصيد" value={formatCurrency(c.currentBalance)} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
    <p className="text-[11px] text-slate-400">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
  </div>
);
