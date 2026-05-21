import { AlertCircle, Crown } from 'lucide-react';
import { FEATURE_LABELS } from '@/config/subscriptionLimits';
import { useAuth } from '@/hooks/useAuth';
import type { FeatureType } from '@/types';

interface LimitReachedCardProps {
  feature: FeatureType;
}

export function LimitReachedCard({ feature }: LimitReachedCardProps) {
  const { user } = useAuth();

  return (
    <div className="glass rounded-2xl p-6 neon-border-purple text-center">
      <AlertCircle className="w-10 h-10 text-neon-purple mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-white mb-2">
        {FEATURE_LABELS[feature]}次数已用完
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        {user?.subscriptionTier === 'free'
          ? '免费版已达使用上限，升级付费版解锁更多次数。'
          : '今日次数已用完，明天自动重置。'}
      </p>
      {user?.subscriptionTier === 'free' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-sm">
          <Crown className="w-4 h-4" />
          联系管理员升级为付费版
        </div>
      )}
    </div>
  );
}
