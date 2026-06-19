'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';

interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const { toast } = useToast();

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to send verification email');
      
      toast({
        title: 'Email sent',
        description: `We've sent a new verification link to ${email}.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-amber-500/10 px-4 py-3 sm:px-6 lg:px-8 border-b border-amber-500/20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please verify your email address to receive change alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
            onClick={handleResend}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Resend email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
            onClick={() => setIsVisible(false)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
