import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar = ({ value, color, className, showLabel }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx('w-full', className)}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color || '#0F172A' }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-left text-xs text-slate-500">{Math.round(clamped)}%</div>
      )}
    </div>
  );
};
