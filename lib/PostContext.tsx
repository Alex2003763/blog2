import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { BlogPost } from './dynamodb';

// Define the shape of the context data
interface PostContextType {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  searchPosts: (query: string) => BlogPost[];
  getPostBySlug: (slug: string) => BlogPost | undefined;
}

// Create the context
const PostContext = createContext<PostContextType | undefined>(undefined);

// Custom hook to use the PostContext
export const usePosts = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

// Define the props for the provider component
interface PostProviderProps {
  children: ReactNode;
}

// The provider component
export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndStorePosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get posts from localStorage first
        const cachedPosts = localStorage.getItem('allPosts');
        const cacheTimestamp = localStorage.getItem('postsTimestamp');
        const now = new Date().getTime();

        // Cache is valid for 1 hour
        if (cachedPosts && cacheTimestamp && (now - parseInt(cacheTimestamp, 10)) < 3600000) {
          setPosts(JSON.parse(cachedPosts));
        } else {
          // Fetch from API if cache is old or doesn't exist
          const response = await fetch('/api/posts?fetchAll=true');
          const data = await response.json();

          if (data.success) {
            setPosts(data.data.posts);
            // Store in localStorage
            localStorage.setItem('allPosts', JSON.stringify(data.data.posts));
            localStorage.setItem('postsTimestamp', now.toString());
          } else {
            setError('Failed to load posts');
          }
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Error loading posts');
      } finally {
        setLoading(false);
      }
    };

    fetchAndStorePosts();
  }, []);

  const searchPosts = useCallback((query: string): BlogPost[] => {
    if (!query || !query.trim()) return [];
    
    const lowercasedQuery = query.trim().toLowerCase();
    
    return posts.filter(post => {
      const titleMatch = post.title && post.title.toLowerCase().includes(lowercasedQuery);
      const contentMatch = post.content && post.content.toLowerCase().includes(lowercasedQuery);
      return titleMatch || contentMatch;
    });
  }, [posts]);

  const getPostBySlug = useCallback((slug: string): BlogPost | undefined => {
    return posts.find(post => post.slug === slug);
  }, [posts]);

  const value: PostContextType = {
    posts,
    loading,
    error,
    searchPosts,
    getPostBySlug,
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};