import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, ListChecks, Activity, Settings } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '../../constants/routes';

const items = [
  { to: ROUTES.DASHBOARD, label: 'الرئيسية', icon: LayoutDashboard },
  { to: ROUTES.CENTERS, label: 'المراكز', icon: Wallet },
  { to: ROUTES.TASKS, label: 'المهام', icon: ListChecks },
  { to: ROUTES.ANALYSIS, label: 'التحليل', icon: Activity },
  { to: ROUTES.SETTINGS, label: 'الإعدادات', icon: Settings },
];

export const BottomNav = () => (
  <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white">
    <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition',
              isActive ? 'text-slate-900' : 'text-slate-400'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className={clsx(isActive && 'font-semibold')}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);
