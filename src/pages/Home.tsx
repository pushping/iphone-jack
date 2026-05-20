import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Film, Zap } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAppStore } from '@/hooks/useAppState';

// 懒加载重组件 — Three.js + Canvas 粒子单独拆包
const ParticleBackground = lazy(() =>
  import('@/components/particle-bg/ParticleBackground').then((m) => ({
    default: m.ParticleBackground,
  })),
);
const Phone3D = lazy(() =>
  import('@/components/3d-showcase/Phone3D').then((m) => ({
    default: m.Phone3D,
  })),
);

const features = [
  {
    icon: Sparkles,
    title: '智能提示词生成',
    desc: '基于 AI 模板自动生成专业营销文案',
    color: 'text-neon-cyan',
    border: 'neon-border-cyan',
  },
  {
    icon: Film,
    title: '短视频自动生成',
    desc: '一键生成专业营销短视频',
    color: 'text-neon-purple',
    border: 'neon-border-purple',
  },
  {
    icon: Zap,
    title: '3D 沉浸式体验',
    desc: '科技感视觉设计与粒子动画效果',
    color: 'text-neon-blue',
    border: 'neon-border-blue',
  },
];

export function Home() {
  const navigate = useNavigate();
  const { state } = useAppStore();
  const hasImages = state.uploadedImages.length > 0;

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Suspense fallback={null}>
          <ParticleBackground />
        </Suspense>

        {/* Hero */}
        <section className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
            <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
              {/* Left - Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                  <Sparkles className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm text-gray-300">智能短视频生成平台</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                  <span className="text-gradient-cyan-purple">iPhone Jack</span>
                  <br />
                  <span className="text-white/90">让产品脱颖而出</span>
                </h1>

                <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
                  上传 iPhone 手机壳图片，一键生成专业营销短视频。
                  AI 驱动的提示词生成 + 3D 沉浸式展示体验。
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {hasImages ? (
                    <button
                      onClick={() => navigate('/generate')}
                      className="neon-btn-purple px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2"
                    >
                      开始生成 <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/upload')}
                      className="neon-btn-cyan px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2"
                    >
                      上传图片 <ArrowRight className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/video')}
                    className="px-8 py-4 rounded-xl text-gray-300 font-medium text-lg border border-white/10 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Film className="w-5 h-5" /> 查看视频
                  </button>
                </div>
              </motion.div>

              {/* Right - 3D Phone */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Suspense fallback={<div className="w-full h-[500px] md:h-[600px] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon-cyan" /></div>}>
                  <Phone3D />
                </Suspense>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative z-10 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                    className={`glass rounded-2xl p-8 ${feature.border} hover:scale-[1.02] transition-transform`}
                  >
                    <Icon className={`w-10 h-10 ${feature.color} mb-4`} />
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
