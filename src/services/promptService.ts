import type { PromptTemplate } from '@/types';

// Mock templates - simulating prompt generation
const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: 'professional',
    name: '专业产品展示',
    description: '适合正式的产品展示和电商场景',
    prompt:
      'A stunning iPhone case, minimalist design, soft studio lighting, professional product photography, white background, sharp focus, premium material texture',
  },
  {
    id: 'creative',
    name: '创意营销',
    description: '创意十足，吸引眼球，适合社交媒体传播',
    prompt:
      'Creative iPhone case showcase, neon accent lighting, urban aesthetic, high contrast, dynamic composition, cyberpunk vibes, eye-catching visual',
  },
  {
    id: 'minimal',
    name: '简约风格',
    description: '简约而不简单，突出产品质感',
    prompt:
      'Elegant iPhone case, clean minimal composition, natural lighting, pastel tones, soft shadows, Scandinavian aesthetic, premium feel',
  },
  {
    id: 'dramatic',
    name: '戏剧性视觉',
    description: '强烈的视觉冲击，适合品牌宣传片',
    prompt:
      'Dramatic iPhone case reveal, cinematic lighting, dark moody background, volumetric fog, golden rim light, epic composition, film grain',
  },
];

export const promptService = {
  /** Get available prompt templates */
  templates(): PromptTemplate[] {
    return MOCK_TEMPLATES;
  },

  /** Generate a prompt based on template + image description */
  generate(imageDescription: string, templateId?: string): string {
    const template = templateId
      ? MOCK_TEMPLATES.find((t) => t.id === templateId)
      : MOCK_TEMPLATES[0];

    if (imageDescription.trim()) {
      return `${template?.prompt ?? ''}, featuring ${imageDescription}`;
    }

    return template?.prompt ?? MOCK_TEMPLATES[0].prompt;
  },
};
