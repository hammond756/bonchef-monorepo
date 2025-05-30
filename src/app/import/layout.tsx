import { TabLayout } from '@/components/layouts/tab-layout';

export default function ImportLayout({
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