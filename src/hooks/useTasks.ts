import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { getTasks, completeTask } from '../firebase/firestore';
import { Task, TaskStatus } from '../types/task';
import { todayStr } from '../utils/dates';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getTasks(user.uid);
    setTasks(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setStatus = useCallback(
    async (id: string, status: TaskStatus, completedAmount?: number) => {
      if (!user) return;
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newAmount = completedAmount ?? task.completedAmount;
      await completeTask(user.uid, task, status, newAmount);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status, completedAmount: newAmount } : t
        )
      );
    },
    [user, tasks]
  );

  const todayTasks = useMemo(() => {
    const today = todayStr();
    return tasks.filter((t) => t.date === today);
  }, [tasks]);

  return { tasks, todayTasks, loading, refresh, setStatus };
};
