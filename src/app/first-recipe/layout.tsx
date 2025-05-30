import { BaseLayout } from '@/components/layouts/base-layout';

export default function FirstRecipeLayout({
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