import { useUsage } from '@/hooks/useUsage';
import { FEATURE_LABELS } from '@/config/subscriptionLimits';
import { cn } from '@/utils';
import type { FeatureType } from '@/types';

interface UsageBadgeProps {
  feature: FeatureType;
  className?: string;
}

export function UsageBadge({ feature, className }: UsageBadgeProps) {
  const { getRemainingUses, loading } = useUsage();
  const remaining = getRemainingUses(feature);

  if (loading) return null;

  const isUnlimited = remaining === 'unlimited';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
        'glass border border-white/10',
        isUnlimited ? 'text-neon-cyan' : 'text-gray-400',
        className,
      )}
    >
      {isUnlimited ? (
        '无限制'
      ) : (
        <>
          剩余 <span className={cn('font-medium', remaining === 0 && 'text-red-400')}>{remaining}</span> 次
        </>
      )}
    </span>
  );
}
