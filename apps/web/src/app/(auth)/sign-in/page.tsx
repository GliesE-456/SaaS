import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { SignInForm } from '@/components/auth/SignInForm';
import { Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In | Competitor Change Tracker',
  description: 'Sign in to your account',
};

export default function SignInPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-indigo-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Target className="mr-2 h-6 w-6 text-indigo-400" />
          Competitor Change Tracker
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "We caught our main competitor testing new pricing tiers 48 hours before their official announcement. Absolute game changer."
            </p>
            <footer className="text-sm text-indigo-300">Sofia Davis, SaaS Founder</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <Suspense fallback={
            <div className="flex items-center justify-center p-4">
              <span className="text-sm text-muted-foreground animate-pulse">Loading form...</span>
            </div>
          }>
            <SignInForm />
          </Suspense>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/sign-up" className="hover:text-primary underline underline-offset-4">
              Don't have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
