import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useScrollAnimation, sectionVariants, childVariants } from '@/hooks/useScrollAnimation';

interface FeatureSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  badge: string;
  accentColor: 'cyan' | 'purple' | 'blue';
  reverse?: boolean;
  demo: ReactNode;
}

const accentMap = {
  cyan: {
    text: 'text-neon-cyan',
    border: 'neon-border-cyan',
    btn: 'neon-btn-cyan',
    badge: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30',
  },
  purple: {
    text: 'text-neon-purple',
    border: 'neon-border-purple',
    btn: 'neon-btn-purple',
    badge: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30',
  },
  blue: {
    text: 'text-neon-blue',
    border: 'neon-border-blue',
    btn: 'neon-btn-cyan',
    badge: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
  },
};

export function FeatureSection({
  id,
  title,
  subtitle,
  description,
  features,
  ctaText,
  ctaLink,
  badge,
  accentColor,
  reverse,
  demo,
}: FeatureSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ref, isInView } = useScrollAnimation();
  const accent = accentMap[accentColor];

  const textContent = (
    <motion.div
      custom={0}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={childVariants}
      className="space-y-6"
    >
      <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-medium border', accent.badge)}>
        {badge}
      </span>
      <h2 className="text-3xl sm:text-4xl font-bold text-white">{title}</h2>
      <p className={cn('text-lg font-medium', accent.text)}>{subtitle}</p>
      <p className="text-gray-400 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <span className={cn('mt-1', accent.text)}>◆</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate(user ? ctaLink : '/register')}
        className={cn(accent.btn, 'px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2')}
      >
        {user ? ctaText : '免费注册体验'} <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );

  const demoContent = (
    <motion.div
      custom={1}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={childVariants}
    >
      {demo}
    </motion.div>
  );

  return (
    <section id={id} ref={ref} className="relative min-h-screen flex items-center py-20">
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className={cn('grid md:grid-cols-2 gap-12 lg:gap-20 items-center', reverse && 'md:direction-rtl')}>
          <div className={cn(reverse && 'md:order-2')}>
            {textContent}
          </div>
          <div className={cn(reverse && 'md:order-1')}>
            {demoContent}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
