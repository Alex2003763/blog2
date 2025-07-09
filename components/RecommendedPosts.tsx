import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '../lib/dynamodb';
import { formatDate } from '../lib/utils';
import { CalendarIcon, UserIcon, ArrowRightIcon } from './icons';

interface RecommendedPostsProps {
  currentPostId: string;
  currentPostTags?: string[];
}

export default function RecommendedPosts({ currentPostId, currentPostTags = [] }: RecommendedPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedPosts();
  }, [currentPostId]);

  const fetchRecommendedPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');
      const data = await response.json();
      
      if (data.success) {
        // Filter out current post and get random 3 posts
        const filteredPosts = data.data.posts
          .filter((post: BlogPost) => post.id !== currentPostId)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        setPosts(filteredPosts);
      }
    } catch (error) {
      console.error('Error fetching recommended posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recommended-posts">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          推薦文章
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="recommended-posts">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Recommended articles
      </h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Link href={`/posts/${post.slug}`} className="line-clamp-2">
                  {post.title}
                </Link>
              </h4>
              
              {post.excerpt && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-3 h-3" />
                  <span>{post.author}</span>
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
    </div>
  );
}