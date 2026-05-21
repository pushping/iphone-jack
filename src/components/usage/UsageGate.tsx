import { type ReactNode } from 'react';
import { useUsage } from '@/hooks/useUsage';
import { LimitReachedCard } from './LimitReachedCard';
import type { FeatureType } from '@/types';

interface UsageGateProps {
  feature: FeatureType;
  children: ReactNode;
  fallback?: ReactNode;
}

export function UsageGate({ feature, children, fallback }: UsageGateProps) {
  const { canUseFeature, loading } = useUsage();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neon-cyan" />
      </div>
    );
  }

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  return <>{fallback ?? <LimitReachedCard feature={feature} />}</>;
}
