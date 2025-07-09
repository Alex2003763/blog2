import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDateTime } from '../../lib/utils';
import { BlogPost } from '../../lib/dynamodb';

export default function RecentPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/posts?admin=true&limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPosts(data.data.posts.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Posts</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Posts</h3>
          <Link
            href="/admin/posts"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {posts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
            <Link
              href="/admin/posts/new"
              className="mt-2 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                    >
                      {post.title}
                    </Link>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.published
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDateTime(post.updated_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    Edit
                  </Link>
                  {post.published && (
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}