import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { BlogPost, dynamoDBService } from '../../lib/dynamodb';
import { SettingsService, SiteSettings } from '../../lib/settings';
import { formatDateTime } from '../../lib/utils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TableOfContents from '../../components/TableOfContents';
import RecommendedPosts from '../../components/RecommendedPosts';
import ProgressBar from '../../components/ProgressBar';
import GiscusComments from '../../components/GiscusComments';
import { CalendarIcon, UserIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon, EyeIcon } from '../../components/icons';

// Dynamically import MarkdownRenderer to ensure it's only loaded on the client-side.
// This prevents server-side rendering errors from the mermaid library.
const MarkdownRenderer = dynamic(() => import('../../components/MarkdownRenderer'), {
  ssr: false,
  loading: () => <div className="py-8 text-center">Loading content...</div>,
});

interface PostPageProps {
  post: BlogPost;
  siteSettings: SiteSettings;
  recommendedPosts: BlogPost[];
  prevPost: { slug: string; title: string } | null;
  nextPost: { slug: string; title: string } | null;
}

const PostPage: NextPage<PostPageProps> = ({ post, siteSettings, recommendedPosts, prevPost, nextPost }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Admin check is client-side as it requires localStorage
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        const response = await fetch('/api/auth/check-admin', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setIsAdmin(data.data.isAdmin);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (post?.id) {
      fetch(`/api/posts/${post.id}`, { method: 'POST' });
    }
  }, [post?.id]);


  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton={true} />
        <div className="container px-4 py-16 mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full border-primary animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}/`;
  const ogImage = post.coverImage || `${siteSettings.siteUrl}/og-default.png`; // Assume a default OG image
  const twitterHandle = siteSettings.socialLinks.twitter ? `@${siteSettings.socialLinks.twitter.replace('@', '')}` : '';

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>{`${post.title} | ${siteSettings.siteName}`}</title>
        <meta name="description" content={post.excerpt || post.title} />
        <link rel="canonical" href={pageUrl} />
        <link rel="alternate" type="application/json+oembed" href={`${pageUrl}oembed`} title={`${post.title} oEmbed`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || ''} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={siteSettings.siteName} />
        <meta property="article:published_time" content={new Date(post.created_at).toISOString()} />
        {post.updated_at !== post.created_at && (
          <meta property="article:modified_time" content={new Date(post.updated_at).toISOString()} />
        )}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || ''} />
        <meta name="twitter:image" content={ogImage} />
        {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt || post.title,
            "image": ogImage,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": siteSettings.siteName,
              "logo": {
                "@type": "ImageObject",
                "url": `${siteSettings.siteUrl}/logo.png`
              }
            },
            "datePublished": new Date(post.created_at).toISOString(),
            "dateModified": new Date(post.updated_at).toISOString(),
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": pageUrl
            }
          })}
        </script>
      </Head>

      <Header showBackButton={true} />
      <ProgressBar />

      <main className="py-8 sm:py-12">
        <div className="container mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main Article Content */}
            <div className="lg:col-span-8 lg:col-start-2">
              <article>
                <header className="mb-8">
                  <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl text-foreground">
                    {post.title}
                  </h1>
                  
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
                    {post.views !== undefined && (
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="w-4 h-4" />
                        <span>{post.views} views</span>
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex p-3 my-2 space-x-4 border rounded-md bg-secondary">
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

                <div id="article-content" className="prose dark:prose-invert max-w-none markdown-content">
                  <MarkdownRenderer content={post.content} />
                </div>

                <div className="mt-12">
                  <GiscusComments />
                </div>
                
                <RecommendedPosts posts={recommendedPosts} orientation="horizontal" />
              </article>
            </div>

            {/* Sidebar - Responsive design */}
            <aside className="lg:col-span-3">
              {/* Mobile Table of Contents */}
              <div className="mb-8 lg:hidden">
                <TableOfContents content={post.content} />
              </div>
              
              {/* Desktop Table of Contents and Navigation */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="mb-8">
                    <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">On this page</h3>
                    <div className="table-of-contents-small">
                      <TableOfContents content={post.content} />
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Navigation</h3>
                    <div className="flex flex-col gap-4">
                      {prevPost && (
                        <Link
                          href={`/posts/${prevPost.slug}`}
                          className="flex items-center p-3 text-sm font-medium transition-colors rounded-lg text-primary bg-secondary hover:bg-secondary/80"
                        >
                          <ArrowLeftIcon className="w-4 h-4 mr-2" />
                          <span className="line-clamp-1">{prevPost.title}</span>
                        </Link>
                      )}
                      {nextPost && (
                        <Link
                          href={`/posts/${nextPost.slug}`}
                          className="flex items-center p-3 text-sm font-medium transition-colors rounded-lg text-primary bg-secondary hover:bg-secondary/80"
                        >
                          <ArrowRightIcon className="w-4 h-4 mr-2" />
                          <span className="line-clamp-1">{nextPost.title}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await dynamoDBService.getAllPosts({ status: 'published' });
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string;

  if (!slug) {
    return { notFound: true };
  }

  const post = await dynamoDBService.getPostBySlug(slug);

  if (!post || !post.published) {
    return { notFound: true };
  }

  const siteSettings = await SettingsService.getSiteSettings();
  const allPosts = await dynamoDBService.getAllPosts({ status: 'published' });

  // Find the current post's index
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);

  // Get recommended posts (excluding the current one)
  const recommendedPosts = allPosts
    .filter((p, index) => index !== currentIndex)
    .sort(() => 0.5 - Math.random()) // Shuffle for variety
    .slice(0, 3);

  // Get previous and next posts for navigation
  const prevPostData = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPostData = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const prevPost = prevPostData ? { slug: prevPostData.slug, title: prevPostData.title } : null;
  const nextPost = nextPostData ? { slug: nextPostData.slug, title: nextPostData.title } : null;

  return {
    props: {
      post,
      siteSettings,
      recommendedPosts,
      prevPost,
      nextPost,
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  };
};
