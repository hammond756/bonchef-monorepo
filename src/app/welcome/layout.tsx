import { BaseLayout } from '@/components/layouts/base-layout';
import { TabLayout } from '@/components/layouts/tab-layout';

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabLayout>
      {children}
    </TabLayout>
  );
} 