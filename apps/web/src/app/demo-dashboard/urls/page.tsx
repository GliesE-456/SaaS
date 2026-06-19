"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { DemoUrlCard } from '@/components/demo/DemoUrlCard';
import { MOCK_URLS } from '@/lib/demo-mock-data';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DemoUrlsPage() {
  const { toast } = useToast();

  const handleAddUrlClick = () => {
    toast({
      title: 'Action locked',
      description: 'Demo mode: Please sign up to track and monitor your own competitor URLs!',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        heading="Tracked URLs"
        text="Manage the pages you are monitoring for changes."
      >
        <Button onClick={handleAddUrlClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
          <Plus className="mr-2 h-4 w-4" /> Add URL
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_URLS.map((url) => (
          <DemoUrlCard key={url.id} url={url} />
        ))}
      </div>
    </div>
  );
}
