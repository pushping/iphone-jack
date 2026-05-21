import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Video, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { sectionVariants, childVariants } from '@/hooks/useScrollAnimation';

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

const stats = [
  { icon: Users, value: '10K+', label: '活跃用户' },
  { icon: Video, value: '50K+', label: '视频生成' },
  { icon: ThumbsUp, value: '99%', label: '好评率' },
];

export function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-gray-300">AI 驱动的智能营销平台</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              <span className="text-gradient-cyan-purple">iPhone Jack</span>
              <br />
              <span className="text-white/90">让产品脱颖而出</span>
            </h1>

            <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
              上传产品图片，AI 自动生成专业营销提示词和短视频。
              支持 Midjourney、Sora、Kling 等主流 AI 平台。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(user ? '/upload' : '/register')}
                className="neon-btn-cyan px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2"
              >
                {user ? '开始使用' : '免费注册'} <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('feature-prompt')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-xl text-gray-300 font-medium text-lg border border-white/10 hover:border-white/30 hover:text-white transition-all"
              >
                了解更多 ↓
              </button>
            </div>
          </motion.div>

          {/* Right - 3D Phone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Suspense
              fallback={
                <div className="w-full h-[500px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon-cyan" />
                </div>
              }
            >
              <Phone3D />
            </Suspense>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center gap-8 md:gap-16 mt-8"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent z-10" />
    </section>
  );
}
