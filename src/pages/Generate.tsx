import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Copy, Check, ChevronRight, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAppStore } from '@/hooks/useAppState';
import { useUsage } from '@/hooks/useUsage';
import { UsageGate } from '@/components/usage/UsageGate';
import { UsageBadge } from '@/components/usage/UsageBadge';
import { promptService } from '@/services/promptService';
import { videoService } from '@/services/videoService';
import { cn } from '@/utils';
import type { PromptTemplate, VideoSettings } from '@/types';

const defaultSettings: VideoSettings = {
  duration: 15,
  fps: 30,
  resolution: '1080p',
  style: 'cinematic',
};

export function Generate() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const { recordUsage } = useUsage();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('professional');
  const [copySuccess, setCopySuccess] = useState(false);
  const [generating, setGenerating] = useState(false);

  const templates = promptService.templates();

  // Auto-generate prompt when image or template changes
  useEffect(() => {
    const desc = state.selectedImage ? `product photo of a custom iPhone case` : '';
    const prompt = promptService.generate(desc, selectedTemplateId);
    dispatch({ type: 'SET_PROMPT', payload: prompt });
  }, [state.selectedImage, selectedTemplateId, dispatch]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.generatedPrompt);
      setCopySuccess(true);
      await recordUsage('prompt_gen');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback: select text for manual copy
    }
  };

  const handleGenerateVideo = async () => {
    if (!state.generatedPrompt) return;

    setGenerating(true);
    const video = videoService.generate(state.generatedPrompt, defaultSettings);
    dispatch({ type: 'ADD_VIDEO', payload: video });
    await recordUsage('video_gen');

    setTimeout(() => {
      setGenerating(false);
      navigate('/video');
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <Wand2 className="inline-block w-8 h-8 text-neon-purple mr-2" />
              提示词生成
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              选择模板，生成专业营销视频提示词
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left - Templates (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-lg font-semibold text-white mb-4">选择模板</h2>
              {templates.map((t: PromptTemplate) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 cursor-pointer transition-all',
                    selectedTemplateId === t.id
                      ? 'border-neon-purple bg-neon-purple/5 neon-border-purple'
                      : 'border-white/10 hover:border-neon-cyan/40',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-neon-cyan mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white">{t.name}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{t.description}</p>
                    </div>
                    {selectedTemplateId === t.id && (
                      <Check className="w-5 h-5 text-neon-purple shrink-0 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right - Prompt + Actions (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Prompt Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">生成提示词</h2>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-neon-cyan" />
                      <span className="text-gray-300">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">复制</span>
                    </>
                  )}
                </button>
              </div>

              {/* Prompt Area */}
              <div className="glass rounded-2xl p-6">
                {state.selectedImage ? (
                  <div className="space-y-5">
                    <img
                      src={state.selectedImage.preview}
                      alt="Selected"
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">编辑提示词</label>
                      <textarea
                        value={state.generatedPrompt}
                        onChange={(e) =>
                          dispatch({ type: 'SET_PROMPT', payload: e.target.value })
                        }
                        className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-4 text-white text-sm resize-none focus:border-neon-purple/60 focus:outline-none transition-colors"
                        placeholder="提示词将在此生成..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Sparkles className="w-12 h-12 text-gray-600 mb-4" />
                    <p className="text-gray-500 mb-3">请先选择图片</p>
                    <button
                      onClick={() => navigate('/upload')}
                      className="text-neon-cyan hover:text-white transition-colors text-sm"
                    >
                      去上传 →
                    </button>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <UsageGate feature="video_gen">
                <button
                  onClick={handleGenerateVideo}
                  disabled={generating || !state.generatedPrompt}
                  className="w-full py-4 rounded-xl text-white font-semibold text-lg neon-btn-purple flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      生成中...
                    </>
                  ) : (
                    <>
                      生成视频 <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <UsageBadge feature="video_gen" />
                </div>
              </UsageGate>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
