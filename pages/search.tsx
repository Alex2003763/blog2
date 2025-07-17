import { useState, useEffect } from 'react';
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
import { usePosts } from '../lib/PostContext';

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  const { searchPosts, loading: postsLoading } = usePosts();
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (typeof q === 'string') {
      setSearchTerm(q);
      const results = searchPosts(q);
      setSearchResults(results);
      setCurrentPage(1); 
    } else {
      setSearchResults([]);
    }
  }, [q, searchPosts]);

  const totalPosts = searchResults.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = searchResults.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

          {postsLoading ? (
            <div className="text-center">
              <p>Loading posts...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                {totalPosts > 0 ? (
                  <p>Found {totalPosts} results for &quot;{searchTerm}&quot;.</p>
                ) : (
                  <p>No results found for &quot;{searchTerm}&quot;. Try another search.</p>
                )}
              </div>

              {currentPosts.length > 0 && (
                <div className="space-y-8">
                  {currentPosts.map((post) => (
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