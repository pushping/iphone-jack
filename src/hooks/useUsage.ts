import { useCallback, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppState';
import { api } from '@/lib/api';
import { SUBSCRIPTION_LIMITS, featureToLimitKey } from '@/config/subscriptionLimits';
import type { FeatureType, UsageLimits } from '@/types';
import toast from 'react-hot-toast';

interface UsageResponse {
  counts: Record<string, number>;
  todayCounts: Record<string, number>;
}

function buildUsageLimits(
  tier: 'free' | 'paid',
  counts: Record<string, number>,
  todayCounts: Record<string, number>,
): UsageLimits {
  const limits = SUBSCRIPTION_LIMITS[tier];

  const getCount = (feature: FeatureType): number => {
    // paid video_gen uses daily count, everything else uses total
    if (tier === 'paid' && feature === 'video_gen') {
      return todayCounts[feature] || 0;
    }
    return counts[feature] || 0;
  };

  return {
    promptGen: {
      used: getCount('prompt_gen'),
      limit: limits.prompt_gen,
    },
    imageAnalysis: {
      used: getCount('image_analysis'),
      limit: limits.image_analysis,
    },
    videoGen: {
      used: getCount('video_gen'),
      limit: limits.video_gen,
    },
  };
}

export function useUsage() {
  const { state, dispatch } = useAppStore();
  const { user, usageLimits } = state;

  const refreshUsage = useCallback(async () => {
    if (!user) return;

    const { data, error } = await api.get<UsageResponse>('/usage');
    if (error || !data) return;

    const limits = buildUsageLimits(user.subscriptionTier, data.counts, data.todayCounts);
    dispatch({ type: 'SET_USAGE_LIMITS', payload: limits });
  }, [user, dispatch]);

  // Auto-fetch usage on login
  useEffect(() => {
    if (user) {
      refreshUsage();
    }
  }, [user, refreshUsage]);

  const canUseFeature = useCallback(
    (feature: FeatureType): boolean => {
      if (!user) return false;
      if (!usageLimits) return true; // Still loading, allow (don't flash block)
      const key = featureToLimitKey[feature];
      const { used, limit } = usageLimits[key];
      if (limit === null) return true;
      return used < limit;
    },
    [usageLimits, user],
  );

  const recordUsage = useCallback(
    async (feature: FeatureType): Promise<boolean> => {
      const { error } = await api.post('/usage', { feature });
      if (error) {
        toast.error('记录用量失败');
        return false;
      }
      // Update local state
      const key = featureToLimitKey[feature];
      dispatch({ type: 'INCREMENT_USAGE', payload: key });
      return true;
    },
    [dispatch],
  );

  const getRemainingUses = useCallback(
    (feature: FeatureType): number | 'unlimited' => {
      if (!usageLimits) return 'unlimited'; // Loading, don't show 0
      const key = featureToLimitKey[feature];
      const { used, limit } = usageLimits[key];
      if (limit === null) return 'unlimited';
      return Math.max(0, limit - used);
    },
    [usageLimits],
  );

  return {
    loading: !usageLimits && !!user,
    canUseFeature,
    recordUsage,
    getRemainingUses,
    refreshUsage,
  };
}
