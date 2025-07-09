import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { BlogPost, dynamoDBService } from '../lib/dynamodb';
import { formatDate } from '../lib/utils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import FeaturedPost from '../components/FeaturedPost';
import { CalendarIcon, UserIcon, ArrowRightIcon } from '../components/icons';

interface HomeProps {
  featuredPost: BlogPost | null;
  initialPosts: BlogPost[];
  initialTotalPages: number;
}

export default function Home({ featuredPost, initialPosts, initialTotalPages }: HomeProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async (page: number, query: string = '') => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const url = `/api/posts?page=${page}&limit=6${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // Optionally, set an error state to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
    fetchPosts(1, e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Head>
        <title>Blog Platform - Share Your Stories</title>
        <meta name="description" content="A modern blog platform built with Next.js and DynamoDB" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header showAdminLink={true} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-lg px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <section>
              {posts.length === 0 && !loading ? ( // Only show "No posts yet" if not loading and no posts
                <div className="text-center py-12 lg:py-24">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No posts found</h2>
                    <p className="text-gray-600 dark:text-gray-300">Try a different search term or clear your search.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {posts.length > 0 && (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                          <article
                            key={post.id}
                            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col hover:-translate-y-1"
                          >
                            <div className="p-4 sm:p-5 flex-grow flex flex-col">
                              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                <Link href={`/posts/${post.slug}`} className="line-clamp-2">
                                  {post.title}
                                </Link>
                              </h2>
                              
                              {post.excerpt && (
                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed text-sm flex-grow">
                                  {post.excerpt}
                                </p>
                              )}
                              
                              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-2 xs:space-y-0 mt-auto">
                                <div className="flex items-center space-x-1">
                                  <UserIcon className="w-3 h-3" />
                                  <span className="truncate">{post.author}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  <span>{formatDate(post.created_at)}</span>
                                </div>
                              </div>
                              
                              <Link
                                href={`/posts/${post.slug}`}
                                className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm group-hover:translate-x-1 transition-transform"
                              >
                                <span>Read more</span>
                                <ArrowRightIcon className="w-3 h-3" />
                              </Link>
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
          <aside className="lg:col-span-4 mt-8 lg:mt-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Featured Posts</h3>
            <div className="sticky top-24 space-y-8 max-w-md lg:max-w-none mx-auto">
              {featuredPost && <FeaturedPost post={featuredPost} />}
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
  const initialPosts = totalPosts > 0 ? allPosts.slice(featuredPost ? 1 : 0, postsPerPage) : [];

  return {
    props: {
      featuredPost,
      initialPosts,
      initialTotalPages: totalPages,
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  };
};