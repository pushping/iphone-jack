import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppStore } from '@/hooks/useAppState';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// 懒加载页面 — 按路由拆分，首屏只加载当前页面
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Upload = lazy(() => import('@/pages/Upload').then((m) => ({ default: m.Upload })));
const Generate = lazy(() => import('@/pages/Generate').then((m) => ({ default: m.Generate })));
const VideoPage = lazy(() => import('@/pages/Video').then((m) => ({ default: m.VideoPage })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon-cyan mx-auto mb-3" />
        <p className="text-gray-500 text-sm">加载中...</p>
      </div>
    </div>
  );
}

/** Wait for hydration before rendering routes — prevents flash of empty state */
function AppContent() {
  const { hydrated } = useAppStore();

  if (!hydrated) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <main className="pt-20">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
