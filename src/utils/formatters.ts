export const formatCurrency = (amount: number, currency = 'SAR'): string =>
  new Intl.NumberFormat('ar-SA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount
  );

export const formatPercent = (value: number): string => `${value}%`;

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('ar-SA').format(value);
