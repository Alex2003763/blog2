import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { BlogPost } from '../lib/dynamodb';
import { formatDate, isContentJustAnImage } from '../lib/utils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { CalendarIcon, UserIcon, ArrowRightIcon, PhotographIcon } from '../components/icons';

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (typeof q === 'string') {
      setSearchTerm(q);
    }
  }, [q]);

  const fetchPosts = useCallback(async (page: number, query: string) => {
    if (!query) {
      setLoading(false);
      setPosts([]);
      setTotalPages(0);
      setTotalPosts(0);
      return;
    }

    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const url = `/api/posts?page=${page}&limit=10&q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pagination.totalPages);
        setTotalPosts(data.data.pagination.totalPosts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      fetchPosts(currentPage, searchTerm);
    }
  }, [router.isReady, currentPage, searchTerm, fetchPosts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Head>
        <title>{`Search results for "${searchTerm}"`}</title>
        <meta name="description" content={`Search results for blog posts matching "${searchTerm}"`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header showBackButton={true} onBackClick={() => router.back()} backText="Go Back" />

      <main className="container flex-grow px-4 mx-auto">
        <section className="max-w-3xl mx-auto my-8">
          <h1 className="mb-4 text-3xl font-bold text-center text-foreground">Search Results</h1>
          <div className="mb-8">
            <SearchInput initialValue={searchTerm} />
          </div>

          {loading ? (
            <div className="text-center">
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                {totalPosts > 0 ? (
                  <p>Found {totalPosts} results for "{searchTerm}".</p>
                ) : (
                  <p>No results found for "{searchTerm}". Try another search.</p>
                )}
              </div>

              {posts.length > 0 && (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <article key={post.id} className="p-6 transition-shadow border rounded-lg bg-card hover:shadow-md">
                      <h2 className="mb-2 text-2xl font-semibold text-foreground hover:text-primary">
                        <Link href={`/posts/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>
                      <div className="flex items-center mb-4 space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      {isContentJustAnImage(post.content) ? (
                        <div className="flex items-center justify-center my-4 text-muted-foreground">
                          <PhotographIcon className="w-12 h-12" />
                        </div>
                      ) : (
                        post.excerpt && (
                          <p className="mb-4 text-muted-foreground line-clamp-3">
                            {post.excerpt}
                          </p>
                        )
                      )}
                      <Link href={`/posts/${post.slug}`} className="inline-flex items-center font-medium text-primary hover:underline">
                        Read More
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}