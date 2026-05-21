import { lazy, Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureSection } from '@/components/home/FeatureSection';
import { PageTransition } from '@/components/layout/PageTransition';

const PromptDemo = lazy(() => import('@/components/home/PromptDemo').then((m) => ({ default: m.PromptDemo })));
const AnalysisDemo = lazy(() => import('@/components/home/AnalysisDemo').then((m) => ({ default: m.AnalysisDemo })));
const VideoDemo = lazy(() => import('@/components/home/VideoDemo').then((m) => ({ default: m.VideoDemo })));
const PricingSection = lazy(() => import('@/components/home/PricingSection').then((m) => ({ default: m.PricingSection })));

const DemoFallback = () => (
  <div className="glass rounded-2xl p-6 h-64 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan" />
  </div>
);

export function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen relative">
        <HeroSection />

        <Suspense fallback={<DemoFallback />}>
          <FeatureSection
            id="feature-prompt"
            title="智能提示词生成"
            subtitle="一句话，生成全平台优化提示词"
            description="选择目标 AI 平台（Midjourney、Sora、DALL-E、Kling 等），系统自动生成针对该平台优化的专业提示词，直接复制使用。"
            features={[
              '支持 6+ 主流 AI 平台',
              '自动优化关键词和参数',
              '可编辑自定义后再复制',
              '免费用户可使用 5 次',
            ]}
            ctaText="立即体验"
            ctaLink="/generate"
            badge="功能一"
            accentColor="cyan"
            demo={<PromptDemo />}
          />

          <FeatureSection
            id="feature-analysis"
            title="图片智能分析"
            subtitle="上传图片，AI 自动识别产品特征"
            description="上传一张产品图片，AI 视觉模型自动分析颜色、材质、设计风格等特征，生成结构化的营销描述和视频提示词。"
            features={[
              'AI 视觉识别产品细节',
              '自动生成营销文案',
              '一键转化为视频提示词',
              '免费用户可使用 5 次',
            ]}
            ctaText="开始分析"
            ctaLink="/upload"
            badge="功能二"
            accentColor="purple"
            reverse
            demo={<AnalysisDemo />}
          />

          <FeatureSection
            id="feature-video"
            title="视频一键生成"
            subtitle="从提示词到成品视频，一步到位"
            description="输入提示词或基于图片分析结果，AI 直接生成产品营销短视频。支持多种分辨率和风格选择。"
            features={[
              '720p / 1080p 多分辨率',
              '15s / 30s 时长选择',
              '电影 / 极简 / 活力风格',
              '免费用户可生成 1 个视频',
            ]}
            ctaText="开始生成"
            ctaLink="/video"
            badge="功能三"
            accentColor="blue"
            demo={<VideoDemo />}
          />

          <PricingSection />
        </Suspense>
      </div>
    </PageTransition>
  );
}
