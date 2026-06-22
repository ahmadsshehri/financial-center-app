import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export const Header = ({ title, subtitle, showBack, action }: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              aria-label="رجوع"
            >
              <ChevronRight size={22} />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </header>
  );
};
