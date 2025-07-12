import React, { useState, useEffect } from 'react';
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
    increase: 'text-green-500',
    decrease: 'text-red-500',
    neutral: 'text-muted-foreground'
  }[changeType];

  return (
    <div className="overflow-hidden border rounded-lg shadow-sm bg-card border-border">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 w-0 ml-4">
            <dl>
              <dt className="text-sm font-medium truncate text-muted-foreground">
                {title}
              </dt>
              <dd className="text-2xl font-semibold text-foreground">
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
        const postsResponse = await fetch('/api/posts?admin=true&limit=-1', {
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="overflow-hidden border rounded-lg shadow-sm bg-card border-border">
            <div className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded bg-muted"></div>
                  </div>
                  <div className="flex-1 w-0 ml-4">
                    <div className="w-3/4 h-4 rounded bg-muted"></div>
                    <div className="w-1/2 h-8 mt-2 rounded bg-muted"></div>
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <StatCard
        title="Total Posts"
        value={stats.totalPosts}
        icon={DocumentTextIcon}
      />
      <StatCard
        title="Published Posts"
        value={stats.publishedPosts}
        icon={EyeIcon}
      />
      <StatCard
        title="Draft Posts"
        value={stats.draftPosts}
        icon={CalendarIcon}
      />
    </div>
  );
}