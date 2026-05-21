import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle } from 'lucide-react';
import { cn } from '@/utils';

export function VideoDemo() {
  const [phase, setPhase] = useState<'generating' | 'completed'>('generating');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Auto-cycle: generating 0→100% over 6s, then completed 3s, then reset
    const cycle = () => {
      setPhase('generating');
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((p) => {
          const next = p + Math.random() * 8 + 2;
          if (next >= 100) {
            clearInterval(interval);
            setPhase('completed');
            return 100;
          }
          return next;
        });
      }, 200);

      return interval;
    };

    let interval = cycle();
    const resetTimer = setInterval(() => {
      clearInterval(interval);
      interval = cycle();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(resetTimer);
    };
  }, []);

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      {/* Video preview area */}
      <div className="relative bg-black/40 rounded-xl aspect-video overflow-hidden border border-white/5">
        {phase === 'completed' ? (
          <>
            {/* Mock video playback - animated gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #020617, #1e1b4b, #020617)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 8s ease infinite',
              }}
            />
            {/* Mock product in center with zoom animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-20 h-32 rounded-2xl bg-gradient-to-br from-blue-400/30 to-purple-400/30 border border-white/20"
                style={{ animation: 'float 4s ease-in-out infinite' }}
              />
            </div>
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue mx-auto mb-2" />
              <p className="text-xs text-gray-500">AI 生成中...</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {phase === 'generating' ? '生成中...' : '已完成'}
          </span>
          <span className={cn('text-xs font-medium', phase === 'completed' ? 'text-green-400' : 'text-neon-blue')}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: phase === 'completed'
                ? 'linear-gradient(90deg, #22d3ee, #10b981)'
                : 'linear-gradient(90deg, #22d3ee, #3b82f6, #c084fc)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Status */}
      {phase === 'completed' && (
        <div className="flex items-center gap-2 text-green-400 text-xs">
          <CheckCircle className="w-4 h-4" />
          视频生成完成
        </div>
      )}
    </div>
  );
}
