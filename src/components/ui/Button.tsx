import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800 disabled:bg-blue-300',
  secondary:
    'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 disabled:opacity-50',
  ghost: 'bg-transparent text-blue-700 hover:bg-blue-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

export const Button = ({
  variant = 'primary',
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed',
      variants[variant],
      fullWidth && 'w-full',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
