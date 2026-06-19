'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CheckProgressModal } from './CheckProgressModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

interface CheckNowButtonProps {
  urlId: string;
  onComplete?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CheckNowButton({ urlId, onComplete, variant = 'outline', size = 'sm' }: CheckNowButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Simple client-side rate limiting check
  const [isDisabled, setIsDisabled] = React.useState(false);

  React.useEffect(() => {
    const lastCheck = localStorage.getItem(`lastCheck_${urlId}`);
    if (lastCheck) {
      const elapsed = Date.now() - parseInt(lastCheck, 10);
      if (elapsed < 10 * 60 * 1000) {
        setIsDisabled(true);
      }
    }
  }, [urlId]);

  const handleCheck = async () => {
    if (isDisabled) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/urls/${urlId}/check`, { method: 'POST' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to trigger check');
      }
      
      const data = await res.json();
      setJobId(data.data.jobId);
      setModalOpen(true);
      
      // Update local rate limit
      localStorage.setItem(`lastCheck_${urlId}`, Date.now().toString());
      setIsDisabled(true);
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

  const handleComplete = () => {
    if (onComplete) onComplete();
    router.refresh();
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant={variant}
                size={size}
                onClick={handleCheck}
                disabled={isLoading || isDisabled}
              >
                <RefreshCw className={`h-4 w-4 ${size !== 'icon' ? 'mr-2' : ''} ${isLoading ? 'animate-spin' : ''}`} />
                {size !== 'icon' && 'Check Now'}
              </Button>
            </span>
          </TooltipTrigger>
          {isDisabled && (
            <TooltipContent>
              <p>You can only trigger a manual check once every 10 minutes.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {jobId && (
        <CheckProgressModal
          jobId={jobId}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
