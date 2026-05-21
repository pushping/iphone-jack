import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { api } from '@/lib/api';
import { cn } from '@/utils';

interface Stats {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
  usageByFeature: { feature: string; count: number }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>('/admin/stats').then(({ data, error }) => {
      if (data) setStats(data);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: '总用户数', value: stats?.totalUsers ?? 0, color: 'text-neon-cyan', border: 'neon-border-cyan' },
    { label: '免费用户', value: stats?.freeUsers ?? 0, color: 'text-gray-300', border: 'border-white/10' },
    { label: '付费用户', value: stats?.paidUsers ?? 0, color: 'text-neon-purple', border: 'neon-border-purple' },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-7 h-7 text-neon-purple" />
          <h1 className="text-2xl font-bold text-white">管理仪表盘</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className={cn('glass rounded-2xl p-6', card.border)}>
              <p className="text-sm text-gray-400 mb-1">{card.label}</p>
              <p className={cn('text-3xl font-bold', card.color)}>
                {loading ? '...' : card.value}
              </p>
            </div>
          ))}
        </div>

        {stats?.usageByFeature && stats.usageByFeature.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">功能使用量</h2>
            <div className="grid grid-cols-3 gap-4">
              {stats.usageByFeature.map((u) => (
                <div key={u.feature} className="text-center">
                  <p className="text-2xl font-bold text-neon-blue">{u.count}</p>
                  <p className="text-xs text-gray-400">
                    {u.feature === 'prompt_gen' ? '提示词' : u.feature === 'image_analysis' ? '图片分析' : '视频生成'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/admin/users"
            className="glass rounded-2xl p-6 neon-border-purple hover:scale-[1.02] transition-transform"
          >
            <Users className="w-8 h-8 text-neon-purple mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">用户管理</h3>
            <p className="text-sm text-gray-400">查看、搜索用户，管理角色和套餐</p>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
