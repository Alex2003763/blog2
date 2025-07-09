import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  UserIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

function StatCard({ title, value, icon: Icon, change, changeType = 'neutral' }: StatCardProps) {
  const changeColor = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }[changeType];

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </dd>
            </dl>
          </div>
        </div>
        {change && (
          <div className="mt-4">
            <div className="flex items-center">
              <span className={`text-sm font-medium ${changeColor}`}>
                {change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                from last month
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats({
            ...data.data,
            loading: false
          });
        }
      } else {
        // Fallback to posts API if stats API doesn't exist
        const postsResponse = await fetch('/api/posts?admin=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          if (postsData.success) {
            const posts = postsData.data.posts;
            setStats({
              totalPosts: posts.length,
              publishedPosts: posts.filter((p: any) => p.published).length,
              draftPosts: posts.filter((p: any) => !p.published).length,
              loading: false
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Posts"
        value={stats.totalPosts}
        icon={DocumentTextIcon}
        change="+12%"
        changeType="increase"
      />
      <StatCard
        title="Published Posts"
        value={stats.publishedPosts}
        icon={EyeIcon}
        change="+8%"
        changeType="increase"
      />
      <StatCard
        title="Draft Posts"
        value={stats.draftPosts}
        icon={CalendarIcon}
        change="+2%"
        changeType="increase"
      />
    </div>
  );
}