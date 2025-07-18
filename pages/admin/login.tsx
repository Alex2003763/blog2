import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.data.token);
        router.push('/admin');
      } else {
        setError(data.error || '登入失敗');
      }
    } catch (err) {
      setError('網路錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-background sm:px-6 lg:px-8">
      <Head>
        <title>管理員登入 - 部落格平台</title>
        <meta name="description" content="管理員登入頁面" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            <Link href="/">部落格平台</Link>
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-foreground">
            管理員登入
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 shadow bg-card sm:rounded-lg sm:px-10 border-border">
          {error && (
            <div className="px-4 py-3 mb-4 border rounded bg-destructive/10 border-destructive/20 text-destructive-foreground">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                使用者名稱
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 placeholder-gray-400 border rounded-md shadow-sm appearance-none border-border bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="請輸入您的使用者名稱"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                密碼
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 placeholder-gray-400 border rounded-md shadow-sm appearance-none border-border bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="請輸入您的密碼"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium border border-transparent rounded-md shadow-sm text-primary-foreground bg-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? '登入中...' : '登入'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-primary hover:opacity-80"
            >
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}