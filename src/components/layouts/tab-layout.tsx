import { TopBar } from '@/components/layout/top-bar';
import { TabBar } from '@/components/layout/tab-bar';

interface TabLayoutProps {
  children: React.ReactNode;
  topBarContent?: React.ReactNode;
  tabBarContent?: React.ReactNode;
}

export const TabLayout = ({ 
  children, 
  topBarContent, 
  tabBarContent 
}: TabLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar>
        {topBarContent}
      </TopBar>
      
      <main className="flex flex-1">
        {children}
      </main>
      
      <TabBar>
        {tabBarContent}
      </TabBar>
    </div>
  );
}; 