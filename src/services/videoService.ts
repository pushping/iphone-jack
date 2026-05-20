import type { Video, VideoSettings } from '@/types';
import { generateId } from '@/utils';

// Mock video generation — simulates async processing
export const videoService = {
  /** Submit a video generation task */
  generate(prompt: string, _settings: VideoSettings): Video {
    return {
      id: generateId(),
      prompt,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };
  },

  /** Simulate progress updates (call with interval) */
  simulateProgress(video: Video): Video {
    if (video.status === 'completed' || video.status === 'failed') {
      return video;
    }

    const increment = Math.random() * 25 + 5;
    const newProgress = Math.min(video.progress + increment, 100);
    const newStatus: Video['status'] =
      newProgress >= 100 ? 'completed' : newProgress > 30 ? 'processing' : 'pending';

    return {
      ...video,
      progress: newProgress,
      status: newStatus,
      url: newStatus === 'completed' ? `#/videos/${video.id}` : undefined,
    };
  },

  /** List all videos (mock) */
  list(): Video[] {
    return [];
  },

  /** Delete a video (mock) */
  delete(_videoId: string): boolean {
    return true;
  },
};
