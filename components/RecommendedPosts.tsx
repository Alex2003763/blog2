import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '../lib/dynamodb';
import { formatDate } from '../lib/utils';
import { CalendarIcon, UserIcon, ArrowRightIcon } from './icons';

interface RecommendedPostsProps {
  posts: BlogPost[];
  orientation?: 'vertical' | 'horizontal';
}

export default function RecommendedPosts({ posts, orientation = 'vertical' }: RecommendedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const containerClasses = orientation === 'vertical'
    ? 'space-y-4'
    : 'grid grid-cols-1 md:grid-cols-3 gap-4';

  const articleClasses = orientation === 'vertical'
    ? 'p-3 transition-colors rounded-md group-hover:bg-accent'
    : 'p-4 border rounded-lg group bg-card hover:shadow-lg flex flex-col h-full';

  return (
    <div className={orientation === 'horizontal' ? 'mt-12' : ''}>
      <h3 className="mb-4 text-xl font-bold text-foreground">Recommended Posts</h3>
      <div className={containerClasses}>
        {posts.map((post) => (
          <Link href={`/posts/${post.slug}`} key={post.id} className="block group">
            <article className={articleClasses}>
              <h4 className="flex-grow font-semibold text-foreground group-hover:text-primary line-clamp-2">
                {post.title}
              </h4>
              <div className="mt-2 text-xs text-muted-foreground">
                <span>{formatDate(post.created_at)}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}