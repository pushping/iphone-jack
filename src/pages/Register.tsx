import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, UserPlus, Sparkles, CheckCircle, Send } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

type Step = 'email' | 'verify' | 'password' | 'done';

export function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Step state
  const [step, setStep] = useState<Step>('email');

  // Form fields
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verifyToken, setVerifyToken] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Step 1: Send verification code
  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: apiError } = await api.post<{ previewUrl?: string }>('/auth/send-code', {
      email: email.trim().toLowerCase(),
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      setCooldown(60);
      setStep('verify');
      if (data?.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    }
  };

  // Step 2: Verify code
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: apiError } = await api.post<{ verifyToken: string }>('/auth/verify-code', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else if (data?.verifyToken) {
      setVerifyToken(data.verifyToken);
      setStep('password');
    }
  };

  // Step 3: Set password and complete registration
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.trim().length < 6) {
      setError('密码至少 6 位');
      return;
    }

    setLoading(true);

    const { data, error: apiError } = await api.post<{ token: string; user: any }>('/auth/register', {
      verifyToken,
      password: password.trim(),
      displayName: displayName.trim() || undefined,
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else if (data) {
      // Store token and redirect — useAppState will restore user on next load
      const { setToken: storeToken } = await import('@/lib/api');
      storeToken(data.token);
      window.location.href = '/upload';
    }
  };

  // Step indicator
  const stepNames = ['邮箱', '验证码', '设置密码'];
  const currentStepIndex = step === 'email' ? 0 : step === 'verify' ? 1 : step === 'password' ? 2 : 3;

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-neon-cyan" />
                <span className="neon-text-cyan text-xl font-bold">iPhone Jack</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">创建账户</h1>
              <p className="text-gray-400 text-sm">免费注册，开始生成营销视频</p>
            </div>

            {/* Step indicator */}
            {step !== 'done' && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {stepNames.map((name, i) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        i < currentStepIndex
                          ? 'bg-neon-cyan text-black'
                          : i === currentStepIndex
                            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan'
                            : 'bg-white/10 text-gray-500'
                      }`}
                    >
                      {i < currentStepIndex ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${i === currentStepIndex ? 'text-white' : 'text-gray-500'}`}>
                      {name}
                    </span>
                    {i < stepNames.length - 1 && (
                      <div className={`w-6 h-px ${i < currentStepIndex ? 'bg-neon-cyan' : 'bg-white/10'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-5">
                <Input
                  label="邮箱"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="cyan" size="lg" loading={loading} className="w-full">
                  <Send className="w-5 h-5" />
                  发送验证码
                </Button>
              </form>
            )}

            {/* Step 2: Verify code */}
            {step === 'verify' && (
              <form onSubmit={handleVerify} className="space-y-5">
                <p className="text-sm text-gray-400">
                  验证码已发送至 <span className="text-neon-cyan">{email}</span>
                </p>

                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener"
                    className="block text-xs text-neon-purple hover:underline"
                  >
                    开发模式：点击查看邮件（Ethereal）
                  </a>
                )}

                <Input
                  label="6 位验证码"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className="text-center text-2xl tracking-[0.5em]"
                />

                <Button type="submit" variant="cyan" size="lg" loading={loading} className="w-full">
                  <KeyRound className="w-5 h-5" />
                  验证
                </Button>

                <div className="text-center">
                  {cooldown > 0 ? (
                    <span className="text-sm text-gray-500">{cooldown} 秒后可重新发送</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendCode}
                      className="text-sm text-neon-cyan hover:underline"
                    >
                      重新发送验证码
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Step 3: Set password */}
            {step === 'password' && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  邮箱已验证：{email}
                </div>

                <Input
                  label="昵称（可选）"
                  type="text"
                  placeholder="你的昵称"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                />
                <Input
                  label="密码"
                  type="password"
                  placeholder="至少 6 位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="确认密码"
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button type="submit" variant="cyan" size="lg" loading={loading} className="w-full">
                  <UserPlus className="w-5 h-5" />
                  完成注册
                </Button>
              </form>
            )}

            {/* Login link */}
            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">已有账户？</span>{' '}
              <Link to="/login" className="text-neon-cyan text-sm hover:underline">
                登录
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
