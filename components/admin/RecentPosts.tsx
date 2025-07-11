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
      <div className="border rounded-lg shadow-sm bg-card border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Recent Posts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-1/4 h-4 rounded bg-muted"></div>
                <div className="w-1/2 h-4 rounded bg-muted"></div>
                <div className="w-1/4 h-4 rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm bg-card border-border">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Recent Posts</h3>
          <Link
            href="/admin/posts"
            className="text-sm transition-opacity text-primary hover:opacity-80"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border">
        {posts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-muted-foreground">No posts yet</p>
            <Link
              href="/admin/posts/new"
              className="inline-block mt-2 transition-opacity text-primary hover:opacity-80"
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
                      className="text-sm font-medium truncate transition-colors text-foreground hover:text-primary"
                    >
                      {post.title}
                    </Link>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.published
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateTime(post.updated_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-sm transition-opacity text-primary hover:opacity-80"
                  >
                    Edit
                  </Link>
                  {post.published && (
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-sm transition-colors text-muted-foreground hover:text-foreground"
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