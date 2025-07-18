import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminLayout from '../../../components/admin/AdminLayout';

// Dynamically load Markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function NewPostPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/posts');
      } else {
        setError(data.error || '建立文章失敗');
      }
    } catch (err) {
      setError('網路錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleContentChange = (value: string | undefined) => {
    setFormData({
      ...formData,
      content: value || '',
    });
  };

  return (
    <>
      <Head>
        <title>新增文章 - 管理後台</title>
        <meta name="description" content="建立一篇新文章" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="建立新文章">
        <div className="max-w-4xl mx-auto">
          <div className="border rounded-lg shadow-sm bg-card border-border">
            <div className="p-6">
              {error && (
                <div className="px-4 py-3 mb-4 border rounded bg-destructive/10 border-destructive/20 text-destructive-foreground">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground">
                    文章標題
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    placeholder="請輸入文章標題"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block mb-2 text-sm font-medium text-foreground">
                    文章內容
                  </label>
                  <div className="overflow-hidden border rounded-md border-border">
                    <MDEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      preview="edit"
                      height={400}
                      visibleDragbar={false}
                      data-color-mode={theme === 'dark' ? 'dark' : 'light'}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                  />
                  <label htmlFor="published" className="block ml-2 text-sm text-foreground">
                    立即發佈
                  </label>
                </div>

                <div className="flex items-center justify-end pt-4 space-x-4">
                  <Link
                    href="/admin/posts"
                    className="px-4 py-2 rounded-md bg-muted text-muted-foreground hover:bg-accent"
                  >
                    取消
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 transition-opacity rounded-md bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-50"
                  >
                    {loading ? '建立中...' : '建立文章'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}