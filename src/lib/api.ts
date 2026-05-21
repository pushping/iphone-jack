const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

function getToken(): string | null {
  return localStorage.getItem('ij_token');
}

export function setToken(token: string) {
  localStorage.setItem('ij_token', token);
}

export function clearToken() {
  localStorage.removeItem('ij_token');
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string }> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Global 401 handling: token expired or invalid
    if (res.status === 401) {
      clearToken();
      localStorage.removeItem('iphone-jack-state');
      window.location.href = '/login';
      return { error: '登录已过期，请重新登录' };
    }

    // Handle non-JSON responses
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { error: `服务器返回非 JSON 响应 (${res.status})` };
    }

    const json = await res.json();

    if (!res.ok) {
      return { error: json.error || '请求失败' };
    }

    return { data: json };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { error: '请求超时，请检查网络连接' };
    }
    return { error: err instanceof Error ? err.message : '网络错误' };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
};
