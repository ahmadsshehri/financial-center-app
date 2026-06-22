import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  action?: React.ReactNode;
}

export const Header = ({ title, subtitle, showBack, showLogo, action }: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg p-1 text-blue-700 hover:bg-blue-50"
              aria-label="رجوع"
            >
              <ChevronRight size={22} />
            </button>
          )}
          <div className="flex items-center gap-2">
            {showLogo && (
              <img
                src="/logo.png"
                alt="المركز المالي"
                className="h-9 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {!showLogo && (
              <div>
                <h1 className="text-lg font-bold text-blue-900">{title}</h1>
                {subtitle && <p className="text-xs text-blue-500">{subtitle}</p>}
              </div>
            )}
          </div>
        </div>
        {action}
      </div>
    </header>
  );
};
