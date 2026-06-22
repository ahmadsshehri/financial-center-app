import { format, addDays, differenceInDays } from 'date-fns';

export const formatDateAr = (date: Date): string => format(date, 'dd/MM/yyyy');

export const getNextPayday = (payday: number, from?: Date): Date => {
  const now = from || new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), payday);
  if (thisMonth > now) return thisMonth;
  return new Date(now.getFullYear(), now.getMonth() + 1, payday);
};

export const generate40DayDates = (startDate: Date): string[] => {
  return Array.from({ length: 40 }, (_, i) =>
    format(addDays(startDate, i), 'yyyy-MM-dd')
  );
};

export const todayStr = (): string => format(new Date(), 'yyyy-MM-dd');

export const daysDiff = (from: Date, to: Date): number =>
  Math.abs(differenceInDays(to, from));
