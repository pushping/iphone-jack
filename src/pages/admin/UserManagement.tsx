import { useState, useEffect, useCallback } from 'react';
import { Users, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

interface UserRow {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  subscriptionTier: string;
  createdAt: string;
  usageCount: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get<UserRow[]>(
      `/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    );
    if (data) setUsers(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateField = async (userId: string, field: string, value: string) => {
    const { error } = await api.patch(`/admin/users/${userId}`, { [field]: value });
    if (error) {
      toast.error('更新失败');
    } else {
      toast.success('更新成功');
      fetchUsers();
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Users className="w-7 h-7 text-neon-purple" />
          <h1 className="text-2xl font-bold text-white">用户管理</h1>
        </div>

        <div className="max-w-md mb-6">
          <Input
            placeholder="搜索邮箱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">邮箱</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">昵称</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">角色</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">套餐</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">使用量</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">注册时间</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">加载中...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">暂无用户</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-white">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{u.displayName || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          u.role === 'admin'
                            ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30'
                            : 'bg-white/5 text-gray-400 border border-white/10',
                        )}>
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {u.role === 'admin' ? '管理员' : '用户'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                          u.subscriptionTier === 'paid'
                            ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                            : 'bg-white/5 text-gray-400 border border-white/10',
                        )}>
                          {u.subscriptionTier === 'paid' ? '付费版' : '免费版'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{u.usageCount} 次</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateField(u.id, 'role', u.role === 'admin' ? 'user' : 'admin')}
                            className="px-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all"
                          >
                            {u.role === 'admin' ? '降为用户' : '升为管理员'}
                          </button>
                          <button
                            onClick={() => updateField(u.id, 'subscriptionTier', u.subscriptionTier === 'paid' ? 'free' : 'paid')}
                            className="px-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all"
                          >
                            {u.subscriptionTier === 'paid' ? '降为免费' : '升为付费'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
