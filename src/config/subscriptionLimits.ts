import type { FeatureType } from '@/types';

export const SUBSCRIPTION_LIMITS = {
  free: {
    prompt_gen: 5,
    image_analysis: 5,
    video_gen: 1,
  },
  paid: {
    prompt_gen: null,     // 无限制
    image_analysis: null, // 无限制
    video_gen: 20,        // 每天 20 次
  },
} as const;

// Map FeatureType to the key used in UsageLimits interface
export const featureToLimitKey: Record<FeatureType, 'promptGen' | 'imageAnalysis' | 'videoGen'> = {
  prompt_gen: 'promptGen',
  image_analysis: 'imageAnalysis',
  video_gen: 'videoGen',
};

export const FEATURE_LABELS: Record<FeatureType, string> = {
  prompt_gen: '提示词生成',
  image_analysis: '图片分析',
  video_gen: '视频生成',
};
