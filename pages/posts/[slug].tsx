import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { BlogPost } from '../../lib/dynamodb';
import { formatDateTime } from '../../lib/utils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TableOfContents from '../../components/TableOfContents';
import RecommendedPosts from '../../components/RecommendedPosts';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { CalendarIcon, UserIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon } from '../../components/icons';

export default function PostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prevPost, setPrevPost] = useState<{ slug: string; title: string } | null>(null);
  const [nextPost, setNextPost] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchPost(slug);
      checkAdminStatus();
    }
  }, [slug]);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchNavigation(slug);
    }
  }, [slug]);

  const fetchNavigation = async (currentSlug: string) => {
    try {
      const response = await fetch(`/api/posts/navigation?currentSlug=${currentSlug}`);
      const data = await response.json();
      if (data.success) {
        setPrevPost(data.data.prevPost);
        setNextPost(data.data.nextPost);
      } else {
        console.error('Failed to fetch navigation:', data.error);
      }
    } catch (error) {
      console.error('Network error fetching navigation:', error);
    }
  };

  const fetchPost = async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/slug/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
      } else {
        setError(data.error || 'Failed to fetch post');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/check-admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setIsAdmin(data.data.isAdmin);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header showBackButton={true} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header showBackButton={true} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 mb-6">{error || 'Post not found'}</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>{post.title} - Blog Platform</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header showBackButton={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-8 md:px-10 md:py-12">
                  {/* Article Header */}
                  <header className="mb-8">
                    {/* Navigation Buttons */}
                    <div className="mb-6 flex justify-between items-center">
                      {prevPost && (
                        <Link
                          href={`/posts/${prevPost.slug}`}
                          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          <ArrowLeftIcon className="w-5 h-5 mr-2" />
                          <span>{prevPost.title}</span>
                        </Link>
                      )}
                      {nextPost && (
                        <Link
                          href={`/posts/${nextPost.slug}`}
                          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium ml-auto"
                        >
                          <span>{nextPost.title}</span>
                          <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </Link>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-6">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {post.title}
                      </h1>
                      {isAdmin && (
                        <div className="flex space-x-2 mt-2">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this post?')) {
                                try {
                                  const token = localStorage.getItem('auth_token');
                                  const response = await fetch(`/api/posts/${post.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                    },
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    alert('Post deleted successfully!');
                                    router.push('/admin/posts'); // Redirect to admin posts list
                                  } else {
                                    alert(data.error || 'Failed to delete post.');
                                  }
                                } catch (error) {
                                  console.error('Error deleting post:', error);
                                  alert('Network error or failed to delete post.');
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDateTime(post.created_at)}</span>
                      </div>
                      {post.updated_at !== post.created_at && (
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>Updated: {formatDateTime(post.updated_at)}</span>
                        </div>
                      )}
                    </div>
                    
                  </header>

                  {/* Article Content */}
                  <div className="prose prose-base max-w-none dark:prose-invert">
                    <MarkdownRenderer content={post.content} />
                  </div>
                </div>
              </article>

              {/* Recommended Posts */}
              <RecommendedPosts currentPostId={post.id} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <TableOfContents content={post.content} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}