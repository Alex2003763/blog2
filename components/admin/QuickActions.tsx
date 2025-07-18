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
  color?: string;
}

function QuickAction({ title, description, href, icon: Icon }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="relative p-6 transition-colors border rounded-lg shadow-sm group bg-card focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary hover:bg-muted border-border"
    >
      <div>
        <span className="inline-flex p-3 rounded-lg bg-primary text-primary-foreground ring-4 ring-background">
          <Icon className="w-6 h-6" />
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function QuickActions() {
  const actions = [
    {
      title: '建立新文章',
      description: '撰寫並發佈一篇新的部落格文章',
      href: '/admin/posts/new',
      icon: PlusIcon,
    },
    {
      title: '管理文章',
      description: '編輯、發佈或刪除現有文章',
      href: '/admin/posts',
      icon: DocumentTextIcon,
    },
    {
      title: '自訂外觀',
      description: '修改主題、顏色和版面配置設定',
      href: '/admin/appearance',
      icon: PaintBrushIcon,
    },
    {
      title: '網站設定',
      description: '配置一般網站設定',
      href: '/admin/settings',
      icon: CogIcon,
    }
  ];

  return (
    <div className="border rounded-lg shadow-sm bg-card border-border">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">快速操作</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <QuickAction
              key={action.title}
              title={action.title}
              description={action.description}
              href={action.href}
              icon={action.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}