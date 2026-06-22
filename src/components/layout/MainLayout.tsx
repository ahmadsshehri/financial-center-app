import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export const MainLayout = ({
  title,
  subtitle,
  showBack,
  action,
  children,
}: MainLayoutProps) => (
  <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
    <Header title={title} subtitle={subtitle} showBack={showBack} showLogo action={action} />
    <main className="mx-auto max-w-md px-4 py-4">{children}</main>
    <BottomNav />
  </div>
);
