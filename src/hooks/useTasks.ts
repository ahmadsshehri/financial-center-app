import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { getTasks, updateTask } from '../firebase/firestore';
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
      const updates: Partial<Task> = { status };
      if (completedAmount !== undefined) updates.completedAmount = completedAmount;
      await updateTask(user.uid, id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    },
    [user]
  );

  const todayTasks = useMemo(() => {
    const today = todayStr();
    return tasks.filter((t) => t.date === today);
  }, [tasks]);

  return { tasks, todayTasks, loading, refresh, setStatus };
};
