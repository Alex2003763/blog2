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
  const [recommendedPosts, setRecommendedPosts] = useState<BlogPost[]>([]);
  const [prevPost, setPrevPost] = useState<{ slug: string; title: string } | null>(null);
  const [nextPost, setNextPost] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchPost(slug);
      fetchRecommendedPosts(slug);
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

  const fetchRecommendedPosts = async (currentSlug: string) => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (data.success) {
        const filtered = data.data.posts
          .filter((p: BlogPost) => p.slug !== currentSlug)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setRecommendedPosts(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch recommended posts:', error);
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
        <div className="container px-4 py-16 mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
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
        <div className="container px-4 py-16 mx-auto">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <p className="mb-6 text-red-600 dark:text-red-400">{error || 'Post not found'}</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
    <div className="min-h-screen bg-background">
      <Head>
        <title>{post.title} - Blog Platform</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header showBackButton={true} />

      <main className="container px-4 py-8 mx-auto sm:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar (Table of Contents) - Left on large screens */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">On this page</h3>
              <TableOfContents content={post.content} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <article>
              {/* Article Header */}
              <header className="mb-8">
                <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl text-foreground">
                  {post.title}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center mb-6 text-sm gap-x-4 gap-y-2 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDateTime(post.created_at)}</span>
                  </div>
                  {post.updated_at !== post.created_at && (
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>Updated: {formatDateTime(post.updated_at)}</span>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex p-3 mt-4 space-x-4 border rounded-md bg-secondary">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit Post
                    </Link>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this post?')) {
                          try {
                            const token = localStorage.getItem('auth_token');
                            const response = await fetch(`/api/posts/${post.id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` },
                            });
                            const data = await response.json();
                            if (data.success) {
                              alert('Post deleted successfully!');
                              router.push('/admin/posts');
                            } else {
                              alert(data.error || 'Failed to delete post.');
                            }
                          } catch (error) {
                            console.error('Error deleting post:', error);
                            alert('Network error or failed to delete post.');
                          }
                        }
                      }}
                      className="text-sm font-medium text-destructive hover:underline"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </header>

              {/* Article Content */}
              <div className="prose dark:prose-invert max-w-none markdown-content">
                <MarkdownRenderer content={post.content} />
              </div>
            </article>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-12 border-t">
              {prevPost ? (
                <Link
                  href={`/posts/${prevPost.slug}`}
                  className="flex items-center font-medium group text-primary"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground">Previous</span>
                    <p className="line-clamp-1">{prevPost.title}</p>
                  </div>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link
                  href={`/posts/${nextPost.slug}`}
                  className="flex items-center font-medium text-right group text-primary"
                >
                   <div className="text-right">
                    <span className="text-xs text-muted-foreground">Next</span>
                    <p className="line-clamp-1">{nextPost.title}</p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : <div />}
            </div>

            {/* Recommended Posts */}
            <RecommendedPosts posts={recommendedPosts} orientation="horizontal" />
          </div>

          {/* Empty right sidebar for spacing */}
          <div className="hidden lg:block lg:col-span-3" />
        </div>
      </main>

      <Footer />
    </div>
  );
}