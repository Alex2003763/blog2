import Link from 'next/link';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  CogIcon, 
  UserIcon,
  ChartBarIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function QuickAction({ title, description, href, icon: Icon, color }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
    >
      <div>
        <span className={`rounded-lg inline-flex p-3 ${color} ring-4 ring-white dark:ring-gray-800`}>
          <Icon className="h-6 w-6 text-white" />
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 dark:text-gray-600 dark:group-hover:text-gray-500">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z"/>
        </svg>
      </span>
    </Link>
  );
}

export default function QuickActions() {
  const actions = [
    {
      title: 'Create New Post',
      description: 'Write and publish a new blog post',
      href: '/admin/posts/new',
      icon: PlusIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Posts',
      description: 'Edit, publish, or delete existing posts',
      href: '/admin/posts',
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Customize Appearance',
      description: 'Modify themes, colors, and layout settings',
      href: '/admin/appearance',
      icon: PaintBrushIcon,
      color: 'bg-pink-500'
    },
    {
      title: 'Site Settings',
      description: 'Configure general website settings',
      href: '/admin/settings',
      icon: CogIcon,
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <QuickAction
              key={action.title}
              title={action.title}
              description={action.description}
              href={action.href}
              icon={action.icon}
              color={action.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}