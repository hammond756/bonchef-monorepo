import { BaseLayout } from '@/components/layouts/base-layout';

export default function ChatLayout({
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