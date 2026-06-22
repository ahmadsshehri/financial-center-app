export interface Transfer {
  id: string;
  fromAccount: string;
  toCenterId: string;
  toCenterKey: string;
  amount: number;
  requiredAmount: number;
  date: string;
  taskId?: string;
  note?: string;
  createdAt: Date;
}

export type WithdrawalReason =
  | "عجز في المصاريف"
  | "تأخر دخل"
  | "طارئ صحي"
  | "التزام غير متوقع"
  | "خطأ في تقدير الميزانية"
  | "مساعدة عائلية"
  | "أخرى";

export const WITHDRAWAL_REASONS: WithdrawalReason[] = [
  "عجز في المصاريف",
  "تأخر دخل",
  "طارئ صحي",
  "التزام غير متوقع",
  "خطأ في تقدير الميزانية",
  "مساعدة عائلية",
  "أخرى",
];

export interface BalanceWithdrawal {
  id: string;
  fromCenterKey: "balance";
  toCenterKey: string;
  amount: number;
  reason: WithdrawalReason;
  note?: string;
  date: string;
  createdAt: Date;
}
