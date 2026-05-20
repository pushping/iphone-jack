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

export interface GeneratedPrompt {
  prompt: string;
  templates: string[];
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
}
