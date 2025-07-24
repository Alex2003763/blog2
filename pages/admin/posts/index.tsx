import React, { useState, useEffect, useCallback } from 'react';
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
  const { q: searchTerm = '', status: statusFilter = 'all', page: pageStr = '1', limit: limitStr = '6' } = router.query;
  const currentPage = parseInt(pageStr as string, 10) || 1;
  const currentLimit = parseInt(limitStr as string, 10) || 6;

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
        limit: currentLimit.toString(),
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
        setError(data.error || '讀取文章失敗');
      }
    } catch (err) {
      setError('網路錯誤');
    } finally {
      setLoading(false);
    }
  }, [router.isReady, searchTerm, statusFilter, currentPage, currentLimit]);

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

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQuery({ limit: e.target.value, page: 1 });
  };

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setIsModalOpen(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    const toastId = toast.loading('刪除文章中...');
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('文章刪除成功', { id: toastId });
        if (posts.length === 1 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        } else {
          fetchPosts();
        }
      } else {
        toast.error(data.error || '刪除文章失敗', { id: toastId });
      }
    } catch (err) {
      toast.error('網路錯誤，請再試一次。', { id: toastId });
    } finally {
      setPostToDelete(null);
      setIsModalOpen(false);
    }
  };

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    const action = currentStatus ? '取消發佈' : '發佈';
    const toastId = toast.loading(`${action}文章中...`);

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
        toast.success(`文章 ${currentStatus ? '已取消發佈' : '已發佈'}`, { id: toastId });
        fetchPosts();
      } else {
        toast.error(data.error || '更新文章狀態失敗', { id: toastId });
      }
    } catch (err) {
      toast.error('網路錯誤，請再試一次。', { id: toastId });
    }
  };

  return (
    <>
      <Head>
        <title>文章管理 - 管理後台</title>
        <meta name="description" content="管理部落格文章" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="文章管理">
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDeletePost}
          title="刪除文章"
          message="您確定要刪除這篇文章嗎？此操作無法復原。"
          confirmButtonText="刪除"
        />
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-foreground">所有文章</h2>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium transition-opacity border border-transparent rounded-md shadow-sm text-primary-foreground bg-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              新增文章
            </Link>
          </div>

          <div className="p-4 border rounded-lg shadow-sm bg-card border-border">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜尋文章..."
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
                  <option value="all">所有狀態</option>
                  <option value="published">已發佈</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
             <div>
               <select
                 value={currentLimit}
                 onChange={handleLimitChange}
                 className="block w-full px-3 py-2 leading-5 border rounded-md bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
               >
                 <option value="6">每頁 6 筆</option>
                 <option value="10">每頁 10 筆</option>
                 <option value="20">每頁 20 筆</option>
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
              <h3 className="mb-4 text-lg font-medium text-foreground">找不到文章</h3>
              <p className="mb-4 text-muted-foreground">請嘗試調整您的搜尋或篩選條件。</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden border rounded-lg shadow-sm bg-card border-border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">標題</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">狀態</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">瀏覽</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">作者</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">日期</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-muted-foreground">操作</th>
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
                              {post.published ? '已發佈' : '草稿'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{post.views ?? 0}</td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{post.author}</td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{formatDateTime(post.updated_at)}</td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-3">
                              <Link href={`/admin/posts/${post.id}`} className="transition-opacity text-primary hover:opacity-80">編輯</Link>
                              {post.published && (
                                <Link href={`/posts/${post.slug}`} className="transition-colors text-muted-foreground hover:text-foreground">檢視</Link>
                              )}
                              <button onClick={() => handleTogglePublish(post.id, post.published)} className={`${post.published ? 'text-yellow-500 hover:opacity-80' : 'text-green-500 hover:opacity-80'} transition-opacity`}>
                                {post.published ? '取消發佈' : '發佈'}
                              </button>
                              <button onClick={() => handleDeletePost(post.id)} className="transition-opacity text-destructive hover:opacity-80">刪除</button>
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