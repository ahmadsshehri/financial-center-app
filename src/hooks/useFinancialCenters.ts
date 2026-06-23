import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getCenters, updateCenter, deleteCenter } from '../firebase/firestore';
import { FinancialCenter } from '../types/center';

// Migrate away from the old "surplus" center: redistribute its % across expenses/balance/debts
const SURPLUS_REDISTRIBUTION: Record<string, number> = {
  expenses: 2.5,
  balance: 2.5,
  debts: 2.5,
};

async function migrateSurplus(uid: string, data: FinancialCenter[]): Promise<FinancialCenter[]> {
  const surplus = data.find((c) => (c.key as string) === 'surplus');
  if (!surplus) return data;

  const updated = data.filter((c) => (c.key as string) !== 'surplus');
  await deleteCenter(uid, surplus.id);

  for (const c of updated) {
    const extra = SURPLUS_REDISTRIBUTION[c.key] ?? 0;
    if (extra > 0) {
      const newPct = c.percentage + extra;
      await updateCenter(uid, c.id, { percentage: newPct });
      c.percentage = newPct;
    }
  }
  return updated;
}

export const useFinancialCenters = () => {
  const { user } = useAuth();
  const [centers, setCenters] = useState<FinancialCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let data = await getCenters(user.uid);
    data = await migrateSurplus(user.uid, data);
    setCenters(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (id: string, updates: Partial<FinancialCenter>) => {
      if (!user) return;
      await updateCenter(user.uid, id, updates);
      setCenters((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    },
    [user]
  );

  return { centers, loading, refresh, update };
};
