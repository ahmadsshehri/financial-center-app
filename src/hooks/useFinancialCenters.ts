import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getCenters, updateCenter } from '../firebase/firestore';
import { FinancialCenter } from '../types/center';

export const useFinancialCenters = () => {
  const { user } = useAuth();
  const [centers, setCenters] = useState<FinancialCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getCenters(user.uid);
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
