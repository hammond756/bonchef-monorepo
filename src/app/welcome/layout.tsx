import { BaseLayout } from '@/components/layouts/base-layout';

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayout>
      {children}
    </BaseLayout>
  );
} 