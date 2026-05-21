import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

const PLATFORMS = [
  { name: 'Midjourney', abbr: 'MJ', prompt: 'A sleek transparent iPhone case with gradient blue-to-purple holographic finish, floating against a dark background with soft cyan rim lighting, product photography, ultra detailed, 8k --ar 9:16 --v 6' },
  { name: 'Sora', abbr: 'So', prompt: 'Cinematic product reveal: camera slowly orbits around a premium iPhone case with iridescent surface, catching light from a single studio softbox, shallow depth of field, professional commercial style, 4K 30fps' },
  { name: 'DALL-E', abbr: 'DA', prompt: 'Product photograph of an elegant iPhone case featuring minimalist geometric patterns etched into matte black aluminum, studio lighting with dramatic shadows, white background, commercial quality' },
  { name: 'Kling', abbr: 'KL', prompt: 'Slow motion video of an iPhone case being placed on a marble surface, camera zooms in to reveal intricate crystalline texture, warm golden ambient lighting, luxury product showcase style' },
];

export function PromptDemo() {
  const [activePlatform, setActivePlatform] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const charIndexRef = useRef(0);
  const pauseRef = useRef(false);

  useEffect(() => {
    const currentPrompt = PLATFORMS[activePlatform].prompt;
    charIndexRef.current = 0;
    setDisplayText('');
    setIsTyping(true);
    pauseRef.current = false;

    intervalRef.current = window.setInterval(() => {
      if (pauseRef.current) return;

      if (charIndexRef.current < currentPrompt.length) {
        charIndexRef.current++;
        setDisplayText(currentPrompt.slice(0, charIndexRef.current));
      } else {
        // Done typing, pause then switch to next platform
        pauseRef.current = true;
        setTimeout(() => {
          setActivePlatform((prev) => (prev + 1) % PLATFORMS.length);
        }, 3000);
      }
    }, 40);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activePlatform]);

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      {/* Platform selector */}
      <div className="flex gap-2 flex-wrap">
        {PLATFORMS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePlatform(i)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              i === activePlatform
                ? 'neon-border-cyan text-neon-cyan bg-neon-cyan/5'
                : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30',
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Prompt output */}
      <div className="bg-black/40 rounded-xl p-4 min-h-[120px] border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow" />
          <span className="text-xs text-gray-500">AI 生成中...</span>
        </div>
        <p className="text-sm text-gray-300 font-mono leading-relaxed">
          {displayText}
          {isTyping && <span className="inline-block w-0.5 h-4 bg-neon-cyan ml-0.5 animate-pulse" />}
        </p>
      </div>

      {/* Copy button (visual only) */}
      <div className="flex justify-end">
        <div className="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/10">
          复制提示词
        </div>
      </div>
    </div>
  );
}
