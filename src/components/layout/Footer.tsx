import { Sparkles } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
            <span className="text-sm font-semibold text-white">iPhone Jack</span>
            <span className="text-xs text-gray-500 ml-1">智能短视频生成平台</span>
          </div>

          <p className="text-xs text-gray-600">
            &copy; {year} iPhone Jack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
