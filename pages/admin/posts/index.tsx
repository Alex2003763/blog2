import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import { BlogPost } from '../../../lib/dynamodb';
import { formatDateTime } from '../../../lib/utils';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Pagination from '../../../components/Pagination';
import ConfirmationModal from '../../../components/admin/ConfirmationModal';
import toast from 'react-hot-toast';

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // The source of truth for filters is the URL query.
  const { q: searchTerm = '', status: statusFilter = 'all', page: pageStr = '1' } = router.query;
  const currentPage = parseInt(pageStr as string, 10) || 1;

  // We use a local state for the search input to allow the user to type freely
  // before submitting the search. It syncs with the URL query on page load.
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const fetchPosts = useCallback(async () => {
    // Don't fetch until the router is ready and has the query params.
    if (!router.isReady) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        admin: 'true',
        page: currentPage.toString(),
        limit: '6',
      });

      if (searchTerm) params.append('q', searchTerm as string);
      if (statusFilter !== 'all') params.append('status', statusFilter as string);

      const response = await fetch(`/api/posts?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pagination.totalPages);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [router.isReady, searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateQuery = (newParams: Record<string, string | number>) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, ...newParams },
    }, undefined, { shallow: true });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ q: String(localSearchTerm), page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQuery({ status: e.target.value, page: 1 });
  };

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setIsModalOpen(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    const toastId = toast.loading('Deleting post...');
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Post deleted successfully', { id: toastId });
        if (posts.length === 1 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        } else {
          fetchPosts();
        }
      } else {
        toast.error(data.error || 'Failed to delete post', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
    } finally {
      setPostToDelete(null);
      setIsModalOpen(false);
    }
  };

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'Unpublishing' : 'Publishing';
    const toastId = toast.loading(`${action} post...`);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Post ${currentStatus ? 'unpublished' : 'published'} successfully`, { id: toastId });
        fetchPosts();
      } else {
        toast.error(data.error || 'Failed to update post status', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
    }
  };

  return (
    <>
      <Head>
        <title>Posts Management - Admin</title>
        <meta name="description" content="Manage blog posts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="Posts Management">
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDeletePost}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmButtonText="Delete"
        />
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-foreground">All Posts</h2>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium transition-opacity border border-transparent rounded-md shadow-sm text-primary-foreground bg-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </div>

          <div className="p-4 border rounded-lg shadow-sm bg-card border-border">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="block w-full py-2 pl-10 pr-3 leading-5 border rounded-md bg-background border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </form>

              <div>
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="block w-full px-3 py-2 leading-5 border rounded-md bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 border rounded-md text-destructive-foreground bg-destructive/10 border-destructive/20">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 border rounded-lg shadow-sm bg-card border-border">
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
          ) : posts.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="mb-4 text-lg font-medium text-foreground">No posts found</h3>
              <p className="mb-4 text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden border rounded-lg shadow-sm bg-card border-border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Title</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Status</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Author</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Date</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-card divide-border">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-muted">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-foreground">{post.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{post.author}</td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{formatDateTime(post.updated_at)}</td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-3">
                              <Link href={`/admin/posts/${post.id}`} className="transition-opacity text-primary hover:opacity-80">Edit</Link>
                              {post.published && (
                                <Link href={`/posts/${post.slug}`} className="transition-colors text-muted-foreground hover:text-foreground">View</Link>
                              )}
                              <button onClick={() => handleTogglePublish(post.id, post.published)} className={`${post.published ? 'text-yellow-500 hover:opacity-80' : 'text-green-500 hover:opacity-80'} transition-opacity`}>
                                {post.published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button onClick={() => handleDeletePost(post.id)} className="transition-opacity text-destructive hover:opacity-80">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}