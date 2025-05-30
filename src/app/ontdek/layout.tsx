import { TabLayout } from '@/components/layouts/tab-layout';

export default function OntdekLayout({
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