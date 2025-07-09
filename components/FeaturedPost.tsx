import Link from 'next/link';
import { BlogPost } from '../lib/dynamodb';
import { formatDate } from '../lib/utils';
import { CalendarIcon, UserIcon, ArrowRightIcon } from './icons';

interface FeaturedPostProps {
  post: BlogPost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  if (!post) return null;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-md shadow-sm mb-4 px-4 py-3 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
          {post.title}
        </Link>
      </h2>
      
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 gap-2">
        <span>{post.author}</span>
        <span>•</span>
        <span>{formatDate(post.created_at)}</span>
      </div>
      
      <Link
        href={`/posts/${post.slug}`}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        title="Read more"
      >
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </article>
  );
}