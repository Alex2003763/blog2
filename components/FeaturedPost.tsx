import Link from 'next/link';
import { BlogPost } from '../lib/dynamodb';
import { formatDate } from '../lib/utils';
import { ArrowRightIcon } from './icons';

interface FeaturedPostProps {
  post: BlogPost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  if (!post) return null;

  return (
    <Link href={`/posts/${post.slug}`} className="block w-full group">
      <article className="relative w-full p-4 transition-colors rounded-lg group-hover:bg-accent">
        <div className="flex flex-col h-full">
          <h2 className="mb-2 text-lg font-bold text-foreground group-hover:text-accent-foreground line-clamp-2">
            {post.title}
          </h2>
          
          <div className="mt-auto text-xs text-muted-foreground group-hover:text-accent-foreground">
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}