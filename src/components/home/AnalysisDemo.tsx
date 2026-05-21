import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

const ANALYSIS_RESULTS = [
  '透明磨砂材质，手感细腻',
  '渐变蓝紫色后壳，镜面效果',
  '四角加固设计，防摔等级高',
  '精准开孔，兼容 MagSafe',
  '轻薄设计，厚度仅 1.2mm',
];

export function AnalysisDemo() {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [visibleResults, setVisibleResults] = useState(0);

  useEffect(() => {
    // Auto-cycle: idle 1s → scanning 2s → results stagger
    const cycle = () => {
      setPhase('idle');
      setVisibleResults(0);

      setTimeout(() => {
        setPhase('scanning');

        setTimeout(() => {
          setPhase('results');
          // Stagger results
          ANALYSIS_RESULTS.forEach((_, i) => {
            setTimeout(() => {
              setVisibleResults(i + 1);
            }, i * 400);
          });
        }, 2000);
      }, 1500);
    };

    cycle();
    const interval = setInterval(cycle, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Image side */}
        <div className="relative bg-black/40 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center border border-white/5">
          {/* Placeholder image representation */}
          <div className="w-24 h-40 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 border border-white/10 flex items-center justify-center">
            <span className="text-xs text-gray-500">产品图</span>
          </div>

          {/* Scan line */}
          {phase === 'scanning' && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-neon-purple shadow-neon-purple"
              style={{
                animation: 'scanLine 2s linear infinite',
              }}
            />
          )}

          {/* Scan overlay */}
          {phase === 'scanning' && (
            <div className="absolute inset-0 bg-neon-purple/5 border border-neon-purple/20 rounded-xl" />
          )}
        </div>

        {/* Results side */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            {phase === 'scanning' && (
              <span className="text-xs text-neon-purple animate-pulse">分析中...</span>
            )}
            {phase === 'results' && (
              <span className="text-xs text-green-400">分析完成</span>
            )}
          </div>

          {ANALYSIS_RESULTS.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={i < visibleResults ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs border transition-all',
                i < visibleResults
                  ? 'bg-neon-purple/5 border-neon-purple/20 text-gray-300'
                  : 'bg-white/[0.02] border-white/5 text-gray-600',
              )}
            >
              {result}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
