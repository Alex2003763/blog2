import { useState, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const params = new URLSearchParams({
        admin: 'true',
        page: page.toString(),
        limit: '6', // Show 6 posts per page
      });

      if (searchTerm) {
        params.append('q', searchTerm);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/posts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Post deleted successfully', { id: toastId });
        // If the deleted post was the last one on the current page, go back one page.
        if (posts.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Otherwise, just refetch the current page.
          fetchPosts(currentPage);
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
        body: JSON.stringify({
          published: !currentStatus,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Post ${currentStatus ? 'unpublished' : 'published'} successfully`, { id: toastId });
        fetchPosts(currentPage);
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
          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Posts
              </h2>
            </div>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </div>

          {/* Filters */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                  className="block w-full px-3 py-2 leading-5 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 text-red-700 border border-red-200 rounded-md bg-red-50 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Posts List */}
          {loading ? (
            <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-1/4 h-4 bg-gray-300 rounded dark:bg-gray-600"></div>
                    <div className="w-1/2 h-4 bg-gray-300 rounded dark:bg-gray-600"></div>
                    <div className="w-1/4 h-4 bg-gray-300 rounded dark:bg-gray-600"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                No posts found
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Title
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Author
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Date
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {post.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              post.published
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                            {post.author}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                            {formatDateTime(post.updated_at)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                href={`/admin/posts/${post.id}`}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Edit
                              </Link>
                              {post.published && (
                                <Link
                                  href={`/posts/${post.slug}`}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                  View
                                </Link>
                              )}
                              <button
                                onClick={() => handleTogglePublish(post.id, post.published)}
                                className={`${
                                  post.published
                                    ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                                    : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                }`}
                              >
                                {post.published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
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