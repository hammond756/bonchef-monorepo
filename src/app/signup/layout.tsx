import { BaseLayout } from '@/components/layouts/base-layout';

export default function SignupLayout({
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