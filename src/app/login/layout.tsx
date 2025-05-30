import { TabLayout } from '@/components/layouts/tab-layout';

export default function LoginLayout({
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