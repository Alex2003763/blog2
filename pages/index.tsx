import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { BlogPost, dynamoDBService } from '../lib/dynamodb';
import { formatDate, isContentJustAnImage } from '../lib/utils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import FeaturedPost from '../components/FeaturedPost';
import RecommendedPosts from '../components/RecommendedPosts';
import SearchInput from '../components/SearchInput';
import { CalendarIcon, UserIcon, ArrowRightIcon, PhotographIcon } from '../components/icons';

interface HomeProps {
  featuredPost: BlogPost | null;
  recommendedPosts: BlogPost[];
  initialPosts: BlogPost[];
  initialTotalPages: number;
}

export default function Home({ featuredPost, recommendedPosts, initialPosts, initialTotalPages }: HomeProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (page: number) => {
    if (page === 1 && initialPosts.length > 0) {
      setPosts(initialPosts);
      setTotalPages(initialTotalPages);
      return;
    }

    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const url = `/api/posts?page=${page}&limit=6`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [initialPosts, initialTotalPages]);

  useEffect(() => {
    const pageFromQuery = router.query.page ? parseInt(router.query.page as string) : 1;
    setCurrentPage(pageFromQuery);
    if (router.isReady) {
      fetchPosts(pageFromQuery);
    }
  }, [router.isReady, router.query.page, fetchPosts]);

  const handlePageChange = (page: number) => {
    router.push(`/?page=${page}`, undefined, { shallow: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Head>
        <title>Blog Platform - Share Your Stories</title>
        <meta name="description" content="A modern blog platform built with Next.js and DynamoDB" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header showAdminLink={true} />

      <main className="container flex-grow px-4 py-8 mx-auto sm:px-6 lg:px-8 lg:py-12">
        {/* Hero Section */}
        <section className="py-8 text-center md:py-12">
          <div className="w-full max-w-md mx-auto">
            <SearchInput />
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-foreground">Latest Posts</h2>
              {posts.length === 0 && !loading ? (
                <div className="py-12 text-center lg:py-24">
                  <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-secondary">
                      <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="mb-3 text-xl font-semibold text-foreground">No posts found</h2>
                    <p className="text-muted-foreground">Try a different search term or clear your search.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {posts.length > 0 && (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {posts.map((post) => (
                          <article
                            key={post.id}
                            className="flex flex-col h-full overflow-hidden transition-all duration-300 transform border rounded-lg group bg-card hover:shadow-lg hover:-translate-y-1"
                          >
                            <div className="flex flex-col flex-grow p-5">
                              <h2 className="mb-2 text-lg font-semibold transition-colors text-foreground group-hover:text-primary">
                                <Link href={`/posts/${post.slug}`} className="line-clamp-2">
                                  {post.title}
                                </Link>
                              </h2>
                              
                              {isContentJustAnImage(post.content) ? (
                                <div className="flex items-center justify-center flex-grow mb-4 text-muted-foreground">
                                  <PhotographIcon className="w-10 h-10" />
                                </div>
                              ) : (
                                post.excerpt && (
                                  <p className="flex-grow mb-4 text-sm text-muted-foreground line-clamp-3">
                                    {post.excerpt}
                                  </p>
                                )
                              )}
                              
                              <div className="flex items-end justify-between mt-auto">
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <UserIcon className="w-3.5 h-3.5" />
                                  <span className="truncate">{post.author}</span>
                                  <span className="px-1">·</span>
                                  <CalendarIcon className="w-3.5 h-3.5" />
                                  <span>{formatDate(post.created_at)}</span>
                                </div>
                                <Link href={`/posts/${post.slug}`} className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                                  Read More
                                  <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                </Link>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="mt-8 lg:col-span-4 lg:mt-0">
            <div className="sticky space-y-6 top-24">
              {featuredPost && (
                <section>
                  <h2 className="mb-4 text-xl font-bold text-foreground">Featured Post</h2>
                  <FeaturedPost post={featuredPost} />
                </section>
              )}
              <RecommendedPosts posts={recommendedPosts} />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const postsPerPage = 6;
  const allPosts = await dynamoDBService.getPublishedPosts();
  allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  const featuredPost = totalPosts > 0 ? allPosts[0] : null;
  const recommendedPosts = allPosts.slice(1, 4); // Get next 3 posts for recommendation
  const initialPosts = allPosts.slice(0, postsPerPage);

  return {
    props: {
      featuredPost,
      recommendedPosts,
      initialPosts,
      initialTotalPages: totalPages,
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  };
};