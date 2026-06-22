import { useMemo } from 'react';
import { Check, MinusCircle, X } from 'lucide-react';
import clsx from 'clsx';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskStatus, TASK_STATUS_LABELS } from '../types/task';
import { formatCurrency } from '../utils/formatters';
import { foundationProgress } from '../utils/calculations';
import { formatDateAr } from '../utils/dates';

const statusStyles: Record<TaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  done: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  missed: 'bg-red-100 text-red-700',
};

export const TasksPage = () => {
  const { tasks, todayTasks, loading, setStatus } = useTasks();
  const progress = useMemo(() => foundationProgress(tasks), [tasks]);

  return (
    <MainLayout title="المهام" subtitle={formatDateAr(new Date())}>
      <Card className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">تقدّم خطة 40 يومًا</h3>
          <span className="text-sm font-semibold text-slate-700">
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar value={progress} />
      </Card>

      <h3 className="mb-3 text-sm font-semibold text-slate-600">مهام اليوم</h3>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">جارٍ التحميل...</p>
      ) : todayTasks.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-slate-400">
            لا توجد مهام مجدولة لهذا اليوم.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayTasks.map((t) => (
            <TaskCard key={t.id} task={t} onSet={setStatus} />
          ))}
        </div>
      )}
    </MainLayout>
  );
};

const TaskCard = ({
  task,
  onSet,
}: {
  task: Task;
  onSet: (id: string, status: TaskStatus, amount?: number) => void;
}) => (
  <Card className="space-y-3">
    <div className="flex items-start justify-between">
      <div>
        <p className="font-semibold text-slate-800">{task.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatCurrency(task.requiredAmount)}
        </p>
      </div>
      <Badge className={statusStyles[task.status]}>
        {TASK_STATUS_LABELS[task.status]}
      </Badge>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <ActionBtn
        active={task.status === 'done'}
        activeClass="border-green-500 bg-green-50 text-green-700"
        onClick={() => onSet(task.id, 'done', task.requiredAmount)}
        icon={<Check size={15} />}
        label="تم"
      />
      <ActionBtn
        active={task.status === 'partial'}
        activeClass="border-amber-500 bg-amber-50 text-amber-700"
        onClick={() => onSet(task.id, 'partial', Math.round(task.requiredAmount / 2))}
        icon={<MinusCircle size={15} />}
        label="جزئي"
      />
      <ActionBtn
        active={task.status === 'missed'}
        activeClass="border-red-500 bg-red-50 text-red-700"
        onClick={() => onSet(task.id, 'missed', 0)}
        icon={<X size={15} />}
        label="لم يتم"
      />
    </div>
  </Card>
);

const ActionBtn = ({
  active,
  activeClass,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium transition',
      active ? activeClass : 'border-slate-200 text-slate-500 hover:bg-slate-50'
    )}
  >
    {icon}
    {label}
  </button>
);
