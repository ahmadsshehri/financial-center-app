export const validateAllocation = (centers: { percentage: number }[]): boolean => {
  const total = centers.reduce((sum, c) => sum + c.percentage, 0);
  return Math.abs(total - 100) < 0.01;
};

export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string): boolean => password.length >= 6;
