"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Activity, CreditCard, LayoutDashboard, Settings, Globe, Wrench } from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
    activePrefix: '/dashboard/overview',
  },
  {
    title: 'Tracked URLs',
    href: '/dashboard/urls',
    icon: Globe,
    activePrefix: '/dashboard/urls',
  },
  {
    title: 'Changes',
    href: '/dashboard/changes',
    icon: Activity,
    activePrefix: '/dashboard/changes',
  },
];

const settingsItems = [
  {
    title: 'Settings',
    href: '/dashboard/settings/profile',
    icon: Settings,
    activePrefix: '/dashboard/settings/profile', // We'll highlight if inside /settings
  },
  {
    title: 'Billing',
    href: '/dashboard/settings/billing',
    icon: CreditCard,
    activePrefix: '/dashboard/settings/billing',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard/overview" className="flex items-center gap-2 font-bold text-primary">
          <Activity className="h-5 w-5" />
          <span>Tracker</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.activePrefix);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-4">
          <h4 className="mb-2 px-3 text-xs font-semibold tracking-tight text-sidebar-foreground/50">
            Configuration
          </h4>
          <nav className="space-y-1">
            {settingsItems.map((item) => {
              const isActive = pathname?.startsWith(item.activePrefix);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
