import { ReactNode, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '../firebase/auth';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
  );
};
