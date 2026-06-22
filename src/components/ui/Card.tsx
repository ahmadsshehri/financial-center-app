import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card = ({ children, className, onClick, style }: CardProps) => (
  <div
    onClick={onClick}
    style={style}
    className={clsx(
      'bg-white border border-slate-200 rounded-xl shadow-card p-5',
      onClick && 'cursor-pointer transition hover:border-slate-300',
      className
    )}
  >
    {children}
  </div>
);
