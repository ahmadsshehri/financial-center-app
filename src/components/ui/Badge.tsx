import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export const Badge = ({ children, color, bgColor, className }: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      !bgColor && 'bg-slate-100 text-slate-700',
      className
    )}
    style={bgColor ? { backgroundColor: bgColor, color } : undefined}
  >
    {children}
  </span>
);
