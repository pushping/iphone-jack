import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Crown } from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useScrollAnimation, sectionVariants, childVariants } from '@/hooks/useScrollAnimation';

const freeFeatures = ['5 个 AI 提示词生成', '5 次图片智能分析', '1 个视频生成', '基础模板支持'];
const paidFeatures = ['无限 AI 提示词生成', '无限图片智能分析', '每天 20 个视频生成', '全部平台支持', '优先客服'];

export function PricingSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ref, isInView } = useScrollAnimation();

  return (
    <section ref={ref} className="relative min-h-screen flex items-center py-20">
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={sectionVariants}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">准备好开始了吗？</h2>
          <p className="text-gray-400">免费注册即可体验，升级解锁全部功能</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free tier */}
          <motion.div custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={childVariants}>
            <div className={cn(
              'glass rounded-2xl p-8 h-full flex flex-col',
              user?.subscriptionTier === 'free' && 'neon-border-cyan',
            )}>
              {user?.subscriptionTier === 'free' && (
                <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 mb-4">
                  当前方案
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-1">免费版</h3>
              <p className="text-3xl font-bold text-white mb-6">¥0</p>
              <ul className="space-y-3 flex-1 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!user && (
                <button
                  onClick={() => navigate('/register')}
                  className="neon-btn-cyan w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                >
                  免费注册 <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Paid tier */}
          <motion.div custom={1} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={childVariants}>
            <div className={cn(
              'glass rounded-2xl p-8 h-full flex flex-col relative overflow-hidden',
              user?.subscriptionTier === 'paid' ? 'neon-border-purple' : 'neon-border-purple',
            )}>
              {user?.subscriptionTier === 'paid' && (
                <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-medium bg-neon-purple/10 text-neon-purple border border-neon-purple/30 mb-4">
                  当前方案
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">付费版</h3>
                <Crown className="w-5 h-5 text-neon-purple" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">联系管理员</p>
              <p className="text-xs text-gray-500 mb-6">升级解锁全部功能</p>
              <ul className="space-y-3 flex-1 mb-8">
                {paidFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-neon-purple flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {user && user.subscriptionTier === 'free' && (
                <div className="neon-btn-purple w-full py-3 rounded-xl text-white font-semibold text-center">
                  联系管理员升级
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
