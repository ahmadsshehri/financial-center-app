import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserProfile } from '../types/user';
import { IncomeSource } from '../types/income';
import { FinancialCenter } from '../types/center';
import { Task } from '../types/task';
import { Transfer, BalanceWithdrawal } from '../types/transfer';
import { HealthScore } from '../types/health';

// ---------- helpers ----------
const toDate = (v: unknown): Date => {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') return new Date(v);
  return new Date();
};

const userRef = (uid: string) => doc(db, 'users', uid);
const sub = (uid: string, name: string) => collection(db, 'users', uid, name);

// ---------- user profile ----------
export const createUserProfile = async (
  uid: string,
  profile: Partial<UserProfile>
): Promise<void> => {
  await setDoc(
    userRef(uid),
    {
      ...profile,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    displayName: data.displayName ?? '',
    email: data.email ?? '',
    createdAt: toDate(data.createdAt),
    onboardingCompleted: data.onboardingCompleted ?? false,
    stage: data.stage ?? 'foundation',
    preferredMode: data.preferredMode ?? 'daily',
    healthScore: data.healthScore ?? 0,
    healthLevel: data.healthLevel ?? 1,
    themeLevel: data.themeLevel ?? 1,
    fixedIncome: data.fixedIncome ?? true,
    payday: data.payday,
    planStartDate: data.planStartDate,
  };
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  await updateDoc(userRef(uid), updates as Record<string, unknown>);
};

// ---------- income sources ----------
export const getIncomeSources = async (uid: string): Promise<IncomeSource[]> => {
  const snap = await getDocs(sub(uid, 'incomeSources'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      type: data.type,
      amount: data.amount,
      isFixed: data.isFixed,
      payday: data.payday,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as IncomeSource;
  });
};

export const addIncomeSource = async (
  uid: string,
  source: Omit<IncomeSource, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(sub(uid, 'incomeSources'), {
    ...source,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateIncomeSource = async (
  uid: string,
  id: string,
  updates: Partial<IncomeSource>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid, 'incomeSources', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteIncomeSource = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', uid, 'incomeSources', id));
};

// ---------- financial centers ----------
export const getCenters = async (uid: string): Promise<FinancialCenter[]> => {
  const snap = await getDocs(query(sub(uid, 'centers'), orderBy('order')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      key: data.key,
      nameAr: data.nameAr,
      descriptionAr: data.descriptionAr,
      percentage: data.percentage,
      monthlyAmount: data.monthlyAmount,
      dailyAmount: data.dailyAmount,
      currentBalance: data.currentBalance ?? 0,
      isActive: data.isActive ?? true,
      order: data.order,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as FinancialCenter;
  });
};

export const updateCenter = async (
  uid: string,
  id: string,
  updates: Partial<FinancialCenter>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid, 'centers', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ---------- tasks ----------
export const getTasks = async (uid: string): Promise<Task[]> => {
  const snap = await getDocs(query(sub(uid, 'tasks'), orderBy('date')));
  return snap.docs.map((d) => mapTask(d.id, d.data()));
};

export const getTasksByDate = async (uid: string, date: string): Promise<Task[]> => {
  const snap = await getDocs(query(sub(uid, 'tasks'), where('date', '==', date)));
  return snap.docs.map((d) => mapTask(d.id, d.data()));
};

const mapTask = (id: string, data: Record<string, unknown>): Task => ({
  id,
  title: data.title as string,
  centerId: data.centerId as string,
  centerKey: data.centerKey as string,
  requiredAmount: data.requiredAmount as number,
  completedAmount: (data.completedAmount as number) ?? 0,
  date: data.date as string,
  frequency: data.frequency as Task['frequency'],
  status: data.status as Task['status'],
  type: data.type as Task['type'],
  weight: (data.weight as number) ?? 1,
  postponedCount: (data.postponedCount as number) ?? 0,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

export const updateTask = async (
  uid: string,
  id: string,
  updates: Partial<Task>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid, 'tasks', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ---------- transfers & withdrawals ----------
export const addTransfer = async (
  uid: string,
  transfer: Omit<Transfer, 'id' | 'createdAt'>
): Promise<string> => {
  const ref = await addDoc(sub(uid, 'transfers'), {
    ...transfer,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getTransfers = async (uid: string): Promise<Transfer[]> => {
  const snap = await getDocs(sub(uid, 'transfers'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as Transfer));
};

export const addWithdrawal = async (
  uid: string,
  w: Omit<BalanceWithdrawal, 'id' | 'createdAt'>
): Promise<string> => {
  const ref = await addDoc(sub(uid, 'withdrawals'), {
    ...w,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getWithdrawals = async (uid: string): Promise<BalanceWithdrawal[]> => {
  const snap = await getDocs(sub(uid, 'withdrawals'));
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as BalanceWithdrawal)
  );
};

// ---------- health scores ----------
export const addHealthScore = async (
  uid: string,
  score: Omit<HealthScore, 'id' | 'createdAt'>
): Promise<string> => {
  const ref = await addDoc(sub(uid, 'healthScores'), {
    ...score,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getLatestHealthScore = async (uid: string): Promise<HealthScore | null> => {
  const snap = await getDocs(
    query(sub(uid, 'healthScores'), orderBy('createdAt', 'desc'))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as HealthScore;
};

// ---------- onboarding batch write ----------
export interface OnboardingPayload {
  centers: {
    key: string;
    nameAr: string;
    descriptionAr: string;
    percentage: number;
    monthlyAmount: number;
    dailyAmount: number;
    currentBalance: number;
    order: number;
  }[];
  tasks: {
    title: string;
    centerKey: string;
    requiredAmount: number;
    date: string;
    frequency: string;
    type: string;
    weight: number;
  }[];
  planStartDate: string;
}

export const completeOnboarding = async (
  uid: string,
  payload: OnboardingPayload
): Promise<void> => {
  const batch = writeBatch(db);

  // write centers, keep id mapping per key
  const centerIdByKey: Record<string, string> = {};
  for (const c of payload.centers) {
    const ref = doc(sub(uid, 'centers'));
    centerIdByKey[c.key] = ref.id;
    batch.set(ref, {
      ...c,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const t of payload.tasks) {
    const ref = doc(sub(uid, 'tasks'));
    batch.set(ref, {
      ...t,
      centerId: centerIdByKey[t.centerKey] ?? '',
      completedAmount: 0,
      status: 'pending',
      postponedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  batch.set(
    userRef(uid),
    {
      onboardingCompleted: true,
      stage: 'foundation',
      planStartDate: payload.planStartDate,
    },
    { merge: true }
  );

  await batch.commit();
};
