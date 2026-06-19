"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Activity, CreditCard, LayoutDashboard, Settings, Globe, Radar } from 'lucide-react';
import { BRANDING } from '@cct/db';

const navItems = [
  {
    title: 'Overview',
    href: '/demo-dashboard/overview',
    icon: LayoutDashboard,
    activePrefix: '/demo-dashboard/overview',
  },
  {
    title: 'Tracked URLs',
    href: '/demo-dashboard/urls',
    icon: Globe,
    activePrefix: '/demo-dashboard/urls',
  },
  {
    title: 'Changes',
    href: '/demo-dashboard/changes',
    icon: Activity,
    activePrefix: '/demo-dashboard/changes',
  },
];

const settingsItems = [
  {
    title: 'Settings',
    href: '/demo-dashboard/settings/profile',
    icon: Settings,
    activePrefix: '/demo-dashboard/settings/profile',
  },
  {
    title: 'Billing',
    href: '/demo-dashboard/settings/billing',
    icon: CreditCard,
    activePrefix: '/demo-dashboard/settings/billing',
  },
];

export function DemoSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-xl text-primary tracking-tight">
          <Radar className="h-5 w-5 text-indigo-500 animate-pulse" />
          <span>{BRANDING.name}</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
            DEMO
          </span>
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
