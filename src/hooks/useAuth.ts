import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export const useAuth = (): AuthContextValue => useContext(AuthContext);
