import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getUserProfile, updateUserProfile } from '../firebase/firestore';
import { UserProfile } from '../types/user';

export const useUserData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getUserProfile(user.uid);
    setProfile(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;
      await updateUserProfile(user.uid, updates);
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [user]
  );

  return { profile, loading, refresh, update };
};
