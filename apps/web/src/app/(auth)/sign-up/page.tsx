import { Metadata } from 'next';
import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Radar } from 'lucide-react';
import { BRANDING } from '@cct/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Create an account | ${BRANDING.name}`,
  description: `Create an account to start tracking competitors with ${BRANDING.name}`,
};

export default function SignUpPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-indigo-900" />
        <Link href="/" className="relative z-20 flex items-center gap-2 text-2xl font-extrabold tracking-tight hover:opacity-80 transition-opacity">
          <Radar className="h-6 w-6 text-indigo-400 animate-pulse" />
          {BRANDING.name}
        </Link>
        <div className="relative z-20 mt-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-400">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              Real-time Monitoring Active
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold tracking-tight">Over 10,000+ page changes</p>
              <p className="text-lg text-indigo-200">
                monitored and summarized by our AI agents every single day. Join the fastest-growing teams staying ahead.
              </p>
            </div>
            <blockquote className="border-l-2 border-indigo-400/50 pl-4 text-sm text-indigo-200/80 italic">
              &ldquo;I used to spend 3 hours every week manually checking competitor sites. OutScout does it automatically and tells me exactly what changed — I found out about a competitor pricing drop before my sales team did.&rdquo;
              <footer className="mt-2 text-xs text-indigo-300/60 not-italic">
                — A founder using OutScout beta
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
          <SignUpForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="hover:text-primary underline underline-offset-4">
              Already have an account? Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
