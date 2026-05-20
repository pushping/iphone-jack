import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, X, CheckCircle, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAppStore, saveImageBlob, removeImageBlob, clearImageBlobs } from '@/hooks/useAppState';
import { cn, generateId } from '@/utils';
import type { Image } from '@/types';

export function Upload() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      const id = generateId();
      const newImage: Image = {
        id,
        file,
        url,
        preview: url,
        uploadedAt: new Date(),
      };

      dispatch({ type: 'ADD_IMAGE', payload: newImage });
      // Persist blob to IndexedDB (fire-and-forget)
      saveImageBlob(id, file).catch(() => {});
    },
    [dispatch],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    onDrop,
  });

  const removeImage = (id: string) => {
    dispatch({ type: 'REMOVE_IMAGE', payload: id });
    removeImageBlob(id).catch(() => {});
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_IMAGES' });
    setPreviewUrl(null);
    clearImageBlobs().catch(() => {});
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <ImagePlus className="inline-block w-8 h-8 text-neon-cyan mr-2" />
              上传图片
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              上传 iPhone 手机壳图片，我们将为你生成专业营销视频
            </p>
          </div>

          {/* Dropzone */}
          <div className="max-w-2xl mx-auto mb-12">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                isDragActive && !isDragReject && 'border-neon-cyan bg-neon-cyan/5',
                isDragReject && 'border-red-500 bg-red-500/5',
                !isDragActive && !isDragReject && 'border-gray-600 hover:border-neon-cyan/60',
              )}
            >
              <input {...getInputProps()} />

              {previewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-80 rounded-lg shadow-neon-cyan"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <UploadIcon className="w-14 h-14 text-neon-cyan mx-auto mb-4 opacity-70" />
                  <p className="text-lg text-gray-300 mb-2">
                    {isDragActive ? '释放以上传' : '拖拽图片到这里'}
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    支持 PNG, JPG, GIF, WebP，最大 10MB
                  </p>
                  <span className="inline-block px-6 py-2.5 rounded-lg neon-btn-cyan text-sm text-white font-medium">
                    选择文件
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          {state.uploadedImages.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  已上传图片 ({state.uploadedImages.length})
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                  >
                    清空全部
                  </button>
                  <button
                    onClick={() => navigate('/generate')}
                    className="text-sm text-neon-cyan hover:text-white transition-colors"
                  >
                    去生成 →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {state.uploadedImages.map((img) => {
                  const isSelected = state.selectedImage?.id === img.id;
                  return (
                    <div
                      key={img.id}
                      onClick={() => dispatch({ type: 'SELECT_IMAGE', payload: img })}
                      className={cn(
                        'relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all',
                        isSelected
                          ? 'border-neon-cyan shadow-neon-cyan'
                          : 'border-white/10 hover:border-neon-cyan/40',
                      )}
                    >
                      <img
                        src={img.preview}
                        alt={img.id}
                        className="w-full aspect-square object-cover"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <CheckCircle
                          className={cn(
                            'w-5 h-5',
                            isSelected ? 'text-neon-cyan' : 'text-gray-400',
                          )}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(img.id);
                          }}
                          className="p-1 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neon-cyan/20 border-2 border-neon-cyan rounded-xl">
                          <CheckCircle className="w-10 h-10 text-neon-cyan" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
