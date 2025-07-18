import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminLayout from '../../../components/admin/AdminLayout';
import { BlogPost } from '../../../lib/dynamodb';

// Dynamically load Markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (id && typeof id === 'string') {
      fetchPost(id);
    }
  }, [router, id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
        setFormData({
          title: data.data.title,
          content: data.data.content,
          published: data.data.published,
        });
      } else {
        setError(data.error || '讀取文章失敗');
      }
    } catch (err) {
      setError('網路錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
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
        setError(data.error || '更新文章失敗');
      }
    } catch (err) {
      setError('網路錯誤');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <AdminLayout title="編輯文章">
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-muted-foreground">載入中...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !post) {
    return (
      <AdminLayout title="編輯文章">
        <div className="py-12 text-center">
          <p className="text-destructive">{error}</p>
          <Link
            href="/admin/posts"
            className="inline-block px-4 py-2 mt-4 text-white rounded bg-primary hover:opacity-80"
          >
            返回文章列表
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>編輯文章 - 管理後台</title>
        <meta name="description" content="編輯現有文章" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title={`編輯: ${post?.title || '文章'}`}>
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
                    已發佈
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
                    disabled={saving}
                    className="px-4 py-2 transition-opacity rounded-md bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-50"
                  >
                    {saving ? '更新中...' : '更新文章'}
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