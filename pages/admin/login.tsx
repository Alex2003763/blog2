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
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
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
        <title>Admin Login - Blog Platform</title>
        <meta name="description" content="Admin login page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            <Link href="/">Blog Platform</Link>
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-foreground">
            Admin Login
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
                Username
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
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
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
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium border border-transparent rounded-md shadow-sm text-primary-foreground bg-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-primary hover:opacity-80"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}