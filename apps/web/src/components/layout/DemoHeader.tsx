"use client";

import Link from 'next/link';
import { Menu, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BRANDING } from '@cct/db';

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <Link href="/demo-dashboard/overview" className="font-bold text-primary flex items-center gap-1.5">
          <span>{BRANDING.name}</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 font-bold px-1 rounded border border-indigo-500/30">
            DEMO
          </span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-between">
        {/* Banner for Read-Only Alert */}
        <div className="hidden sm:flex items-center gap-2 text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">
          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>Viewing live OutScout demo environment. Changes are simulated.</span>
        </div>
        <div className="sm:hidden" />

        <div className="flex items-center space-x-4">
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/10">
            <Link href="/sign-up" className="flex items-center gap-1.5">
              <span>Sign Up for Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-500/20 text-indigo-400 font-bold text-xs">
              DM
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
