import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentPosts from '../../components/admin/RecentPosts';
import QuickActions from '../../components/admin/QuickActions';

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>Admin Dashboard - Blog Platform</title>
        <meta name="description" content="Blog admin dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="Dashboard">
        <div className="space-y-8">
          {/* Statistics Cards */}
          <DashboardStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Posts */}
            <div className="lg:col-span-1">
              <RecentPosts />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>

    
        </div>
      </AdminLayout>
    </>
  );
}