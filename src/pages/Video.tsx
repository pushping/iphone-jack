import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Trash2, Clock, AlertCircle, CheckCircle, RefreshCw, Film, RotateCw, Sun, SlidersHorizontal, Undo2 } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAppStore } from '@/hooks/useAppState';
import { videoService } from '@/services/videoService';
import { cn, formatDate } from '@/utils';
import type { Video as VideoType } from '@/types';

/** Editing state for completed videos */
interface EditState {
  rotation: number;       // 0 | 90 | 180 | 270
  brightness: number;     // 50-150 (100 = normal)
  contrast: number;       // 50-150 (100 = normal)
  filter: 'none' | 'grayscale' | 'sepia' | 'saturate' | 'invert';
  cropActive: boolean;
}

const defaultEdit: EditState = {
  rotation: 0,
  brightness: 100,
  contrast: 100,
  filter: 'none',
  cropActive: false,
};

const FILTER_MAP: Record<EditState['filter'], string> = {
  none: '',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(80%)',
  saturate: 'saturate(200%)',
  invert: 'invert(100%)',
};

const FILTER_LABELS: Record<EditState['filter'], string> = {
  none: '原图',
  grayscale: '黑白',
  sepia: '复古',
  saturate: '鲜艳',
  invert: '反色',
};

export function VideoPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const [playing, setPlaying] = useState(false);
  const [edit, setEdit] = useState<EditState>(defaultEdit);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const videosRef = useRef(state.videos);
  videosRef.current = state.videos;

  // Reset edit state when switching videos
  useEffect(() => {
    setEdit(defaultEdit);
    setShowEditPanel(false);
  }, [state.currentVideo?.id]);

  // Simulate progress for pending/processing videos
  // Use refs to avoid re-registering interval on every state change
  useEffect(() => {
    const tick = () => {
      for (const v of videosRef.current) {
        if (v.status === 'pending' || v.status === 'processing') {
          const updated = videoService.simulateProgress(v);
          dispatch({
            type: 'UPDATE_VIDEO',
            payload: { id: v.id, updates: { progress: updated.progress, status: updated.status, url: updated.url } },
          });
        }
      }
    };

    // Check every 2s, but only tick if there are active videos
    timerRef.current = setInterval(() => {
      const hasActive = videosRef.current.some(
        (v) => v.status === 'pending' || v.status === 'processing',
      );
      if (hasActive) tick();
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dispatch]);

  const handleDelete = (id: string) => {
    dispatch({ type: 'REMOVE_VIDEO', payload: id });
    if (state.currentVideo?.id === id) {
      const remaining = state.videos.filter((v) => v.id !== id);
      dispatch({ type: 'SET_CURRENT_VIDEO', payload: remaining[0] ?? null });
    }
  };

  const statusBadge = (status: VideoType['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs">
            <Clock className="w-3 h-3" /> 等待中
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs">
            <RefreshCw className="w-3 h-3 animate-spin" /> 处理中
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-xs">
            <CheckCircle className="w-3 h-3" /> 已完成
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs">
            <AlertCircle className="w-3 h-3" /> 失败
          </span>
        );
    }
  };

  const currentVideo = state.currentVideo;

  return (
    <PageTransition>
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <Film className="inline-block w-8 h-8 text-neon-cyan mr-2" />
              视频管理
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              查看生成进度，预览和导出营销短视频
            </p>
          </div>

          {/* Main Video Player */}
          {currentVideo ? (
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-white">视频预览</h2>
                {statusBadge(currentVideo.status)}
              </div>

              {/* Player Area */}
              <div className="bg-black/50 rounded-xl overflow-hidden mb-5">
                <div
                  className="aspect-video bg-gradient-to-br from-gray-800/50 to-gray-900/80 flex items-center justify-center overflow-hidden"
                  style={{
                    transform: `rotate(${edit.rotation}deg)`,
                    filter: `brightness(${edit.brightness}%) contrast(${edit.contrast}%) ${FILTER_MAP[edit.filter]}`,
                    transition: 'transform 0.3s ease, filter 0.3s ease',
                  }}
                >
                  {currentVideo.status === 'completed' ? (
                    <div className="text-center">
                      <Play className="w-16 h-16 text-neon-cyan mx-auto mb-3 opacity-80" />
                      <p className="text-gray-400 text-sm">视频播放器</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-neon-cyan mx-auto mb-4" />
                      <p className="text-white/70">
                        {currentVideo.status === 'pending' ? '等待生成...' : '正在生成...'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Player Controls */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPlaying(!playing)}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {playing ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                      </button>
                      <span className="text-gray-500 text-sm">
                        {Math.round(currentVideo.progress)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentVideo.status === 'completed' && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neon-btn-cyan text-sm text-white">
                          <Download className="w-4 h-4" /> 下载
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${currentVideo.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Panel — only for completed videos */}
              {currentVideo.status === 'completed' && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs text-gray-500 uppercase tracking-wider">视频编辑</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEdit(defaultEdit); }}
                        className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors text-xs"
                      >
                        <Undo2 className="w-3.5 h-3.5" /> 重置
                      </button>
                      <button
                        onClick={() => setShowEditPanel(!showEditPanel)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
                          showEditPanel
                            ? 'neon-border-cyan text-neon-cyan'
                            : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10',
                        )}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {showEditPanel ? '收起' : '编辑'}
                      </button>
                    </div>
                  </div>

                  {showEditPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass rounded-xl p-5 space-y-5"
                    >
                      {/* Rotation */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block">旋转</label>
                        <div className="flex items-center gap-2">
                          {[0, 90, 180, 270].map((deg) => (
                            <button
                              key={deg}
                              onClick={() => setEdit((e) => ({ ...e, rotation: deg }))}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                edit.rotation === deg
                                  ? 'neon-border-cyan text-neon-cyan'
                                  : 'bg-white/5 text-gray-400 hover:text-white',
                              )}
                            >
                              <RotateCw className="w-3.5 h-3.5 inline mr-1" style={{ transform: `rotate(${deg}deg)` }} />
                              {deg}°
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Brightness & Contrast sliders */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <Sun className="w-3 h-3" /> 亮度 ({edit.brightness}%)
                          </label>
                          <input
                            type="range"
                            min={50}
                            max={150}
                            value={edit.brightness}
                            onChange={(e) => setEdit((ed) => ({ ...ed, brightness: +e.target.value }))}
                            className="w-full accent-neon-cyan"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" /> 对比度 ({edit.contrast}%)
                          </label>
                          <input
                            type="range"
                            min={50}
                            max={150}
                            value={edit.contrast}
                            onChange={(e) => setEdit((ed) => ({ ...ed, contrast: +e.target.value }))}
                            className="w-full accent-neon-purple"
                          />
                        </div>
                      </div>

                      {/* Filters */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block">滤镜</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(Object.keys(FILTER_LABELS) as EditState['filter'][]).map((f) => (
                            <button
                              key={f}
                              onClick={() => setEdit((e) => ({ ...e, filter: f }))}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                edit.filter === f
                                  ? 'neon-border-purple text-neon-purple'
                                  : 'bg-white/5 text-gray-400 hover:text-white',
                              )}
                            >
                              {FILTER_LABELS[f]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Prompt Display */}
              <div className="mb-5">
                <h3 className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">提示词</h3>
                <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-gray-300 text-sm leading-relaxed">
                  {currentVideo.prompt}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/generate')}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> 返回修改
                </button>
                <button
                  onClick={() => handleDelete(currentVideo.id)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" /> 删除
                </button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-16 text-center mb-8">
              <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">暂无视频</h2>
              <p className="text-gray-500 mb-6">请先上传图片并生成提示词</p>
              <button
                onClick={() => navigate('/generate')}
                className="neon-btn-purple px-8 py-3 rounded-xl text-white font-medium"
              >
                去生成
              </button>
            </div>
          )}

          {/* Video History */}
          {state.videos.length > 1 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                历史记录 ({state.videos.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {state.videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => dispatch({ type: 'SET_CURRENT_VIDEO', payload: video })}
                    className={cn(
                      'glass rounded-xl p-4 cursor-pointer transition-all border-2',
                      currentVideo?.id === video.id
                        ? 'border-neon-cyan'
                        : 'border-transparent hover:border-white/20',
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-neon-cyan" />
                        <span className="text-white text-sm font-medium">
                          视频 #{video.id.slice(-4)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(video.id);
                        }}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-3">{video.prompt}</p>
                    <div className="flex items-center justify-between">
                      {statusBadge(video.status)}
                      <span className="text-gray-600 text-xs">{formatDate(video.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
