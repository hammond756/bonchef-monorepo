import { TopBar } from '@/components/layout/top-bar';

interface BaseLayoutProps {
  children: React.ReactNode;
  topBarContent?: React.ReactNode;
}

export const BaseLayout = ({ children, topBarContent }: BaseLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar>
        {topBarContent}
      </TopBar>
      
      <main className="flex flex-1">
        {children}
      </main>
    </div>
  );
}; 