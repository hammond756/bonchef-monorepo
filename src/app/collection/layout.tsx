import { TabLayout } from '@/components/layouts/tab-layout';

export default function CollectionLayout({
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