import { BaseLayout } from '@/components/layouts/base-layout';

export default function RecipesLayout({
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