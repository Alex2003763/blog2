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
        setError(data.error || 'Failed to fetch post');
      }
    } catch (err) {
      setError('Network error');
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
        setError(data.error || 'Failed to update post');
      }
    } catch (err) {
      setError('Network error');
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
      <AdminLayout title="Edit Post">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !post) {
    return (
      <AdminLayout title="Edit Post">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Link
            href="/admin/posts"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Posts
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Post - Admin</title>
        <meta name="description" content="Edit an existing post" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title={`Edit: ${post?.title || 'Post'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Post Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post Content
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Published
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Link
                    href="/admin/posts"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Update Post'}
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