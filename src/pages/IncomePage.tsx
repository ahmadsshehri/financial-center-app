import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import {
  getIncomeSources,
  addIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
} from '../firebase/firestore';
import { IncomeSource, IncomeType, INCOME_TYPE_LABELS } from '../types/income';
import { formatCurrency } from '../utils/formatters';
import { totalIncome } from '../utils/calculations';

const empty = { name: '', type: 'salary' as IncomeType, amount: 0, isFixed: true };

export const IncomePage = () => {
  const { user } = useAuth();
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    if (!user) return;
    setSources(await getIncomeSources(user.uid));
  };
  useEffect(() => {
    load();
  }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (s: IncomeSource) => {
    setEditing(s.id);
    setForm({ name: s.name, type: s.type, amount: s.amount, isFixed: s.isFixed });
    setOpen(true);
  };

  const save = async () => {
    if (!user || !form.name.trim()) return;
    if (editing) await updateIncomeSource(user.uid, editing, form);
    else await addIncomeSource(user.uid, form);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!user) return;
    await deleteIncomeSource(user.uid, id);
    await load();
  };

  return (
    <MainLayout
      title="مصادر الدخل"
      showBack
      action={
        <Button onClick={openAdd} className="px-3 py-2">
          <Plus size={16} /> إضافة
        </Button>
      }
    >
      <Card className="mb-4 bg-slate-900 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm">إجمالي الدخل الشهري</span>
          <span className="text-xl font-bold">{formatCurrency(totalIncome(sources))}</span>
        </div>
      </Card>

      <div className="space-y-3">
        {sources.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            لا توجد مصادر دخل. أضف مصدرًا للبدء.
          </p>
        )}
        {sources.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800">{s.name}</p>
                <Badge>{INCOME_TYPE_LABELS[s.type]}</Badge>
                {s.isFixed && (
                  <Badge className="bg-green-100 text-green-700">ثابت</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatCurrency(s.amount)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(s)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => remove(s.id)}
                className="rounded-lg p-2 text-red-400 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'تعديل مصدر دخل' : 'إضافة مصدر دخل'}
      >
        <div className="space-y-3">
          <Input
            label="الاسم"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثال: راتب الوظيفة"
          />
          <Select
            label="النوع"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as IncomeType })}
            options={Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Input
            label="المبلغ الشهري"
            type="number"
            value={form.amount || ''}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
            placeholder="0"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.isFixed}
              onChange={(e) => setForm({ ...form, isFixed: e.target.checked })}
            />
            دخل ثابت شهري
          </label>
          <Button fullWidth onClick={save}>
            حفظ
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
};
