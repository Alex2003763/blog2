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
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Network error');
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
        <title>New Post - Admin</title>
        <meta name="description" content="Create a new post" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="Create New Post">
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
                    Post Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block mb-2 text-sm font-medium text-foreground">
                    Post Content
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
                    Publish immediately
                  </label>
                </div>

                <div className="flex items-center justify-end pt-4 space-x-4">
                  <Link
                    href="/admin/posts"
                    className="px-4 py-2 rounded-md bg-muted text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 transition-opacity rounded-md bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Post'}
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