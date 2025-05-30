import { TabLayout } from '@/components/layouts/tab-layout';

export default function SignupLayout({
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