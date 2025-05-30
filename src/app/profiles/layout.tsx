import { BaseLayout } from '@/components/layouts/base-layout';

export default function ProfilesLayout({
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