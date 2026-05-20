import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';

export function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-gradient-cyan-purple mb-4">404</h1>
          <p className="text-gray-400 text-lg mb-8">页面未找到</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 neon-btn-cyan rounded-xl text-white font-medium"
          >
            <Home className="w-5 h-5" /> 返回首页
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
