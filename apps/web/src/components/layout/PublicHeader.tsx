'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRANDING } from '@cct/db';

export function PublicHeader() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // Close mobile menu when pathname changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b border-indigo-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 bg-background/80 w-full">
      {/* Brand Logo */}
      <Link className="flex items-center gap-2 font-heading font-extrabold text-2xl text-primary tracking-tight transition-transform hover:scale-[1.02]" href="/">
        <Radar className="h-6 w-6 text-indigo-500 animate-pulse" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">{BRANDING.name}</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/demo-dashboard/overview' ? 'text-indigo-400 font-semibold' : 'text-slate-300'
            }`}
          href="/demo-dashboard/overview"
        >
          Live Demo
        </Link>
        <Link
          className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/pricing' ? 'text-indigo-400 font-semibold' : 'text-slate-300'
            }`}
          href="/pricing"
        >
          Pricing
        </Link>
        <Link
          className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/changelog' ? 'text-indigo-400 font-semibold' : 'text-slate-300'
            }`}
          href="/changelog"
        >
          Changelog
        </Link>
        <Link
          className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/about' ? 'text-indigo-400 font-semibold' : 'text-slate-300'
            }`}
          href="/about"
        >
          About
        </Link>
        <Link
          className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/sign-in' ? 'text-indigo-400 font-semibold' : 'text-slate-300'
            }`}
          href="/sign-in"
        >
          Log in
        </Link>
        <Button asChild size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/15">
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </nav>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex md:hidden items-center justify-center p-2 rounded-lg border border-indigo-500/15 bg-slate-900/40 text-slate-300 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute inset-x-0 top-14 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col p-6 space-y-6 md:hidden animate-in fade-in slide-in-from-top-2 duration-200 border-b border-indigo-500/20 shadow-2xl">
          <nav className="flex flex-col gap-4">
            <Link
              className={`text-lg font-semibold py-3 border-b border-indigo-500/5 ${pathname === '/demo-dashboard/overview' ? 'text-indigo-400' : 'text-slate-200'
                }`}
              href="/demo-dashboard/overview"
            >
              Live Demo
            </Link>
            <Link
              className={`text-lg font-semibold py-3 border-b border-indigo-500/5 ${pathname === '/pricing' ? 'text-indigo-400' : 'text-slate-200'
                }`}
              href="/pricing"
            >
              Pricing
            </Link>
            <Link
              className={`text-lg font-semibold py-3 border-b border-indigo-500/5 ${pathname === '/changelog' ? 'text-indigo-400' : 'text-slate-200'
                }`}
              href="/changelog"
            >
              Changelog
            </Link>
            <Link
              className={`text-lg font-semibold py-3 border-b border-indigo-500/5 ${pathname === '/about' ? 'text-indigo-400' : 'text-slate-200'
                }`}
              href="/about"
            >
              About
            </Link>
            <Link
              className={`text-lg font-semibold py-3 border-b border-indigo-500/5 ${pathname === '/sign-in' ? 'text-indigo-400' : 'text-slate-200'
                }`}
              href="/sign-in"
            >
              Log in
            </Link>
          </nav>
          <div className="pt-4">
            <Button asChild size="lg" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-6 shadow-lg shadow-indigo-500/20">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
