export interface Image {
  id: string;
  file: File;
  url: string;
  preview: string;
  uploadedAt: Date;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface Video {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  url?: string;
  createdAt: Date;
}

export interface VideoSettings {
  duration: number;
  fps: number;
  resolution: '720p' | '1080p' | '4k';
  style: string;
}

export interface AppState {
  currentStep: 'upload' | 'generate' | 'video';
  uploadedImages: Image[];
  selectedImage: Image | null;
  selectedTemplate: PromptTemplate | null;
  generatedPrompt: string;
  videos: Video[];
  currentVideo: Video | null;
  // Auth (Module 1)
  user: UserProfile | null;
  // Usage (Module 2)
  usageLimits: UsageLimits | null;
}

// --- Auth & User ---
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
  subscriptionTier: 'free' | 'paid';
  createdAt: Date;
}

// --- Usage & Subscription ---
export type FeatureType = 'prompt_gen' | 'image_analysis' | 'video_gen';

export interface UsageLimits {
  promptGen: { used: number; limit: number | null };
  imageAnalysis: { used: number; limit: number | null };
  videoGen: { used: number; limit: number | null };
}
