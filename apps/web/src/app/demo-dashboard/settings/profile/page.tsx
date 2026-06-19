"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DemoProfileSettingsPage() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: 'Action locked',
      description: 'Demo mode: You cannot modify profile settings in the demo environment.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-4xl">
      <PageHeader
        heading="Profile Settings"
        text="Manage your account details and notification preferences."
      />
      
      <div className="grid gap-6">
        <Card className="glass">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Account Information</CardTitle>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
                READ-ONLY
              </span>
            </div>
            <CardDescription className="text-slate-400">
              Your simulated account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input id="name" defaultValue="Demo User" disabled className="bg-slate-900 border-indigo-500/10 text-slate-400" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input id="email" defaultValue="demo@outscout.com" disabled className="bg-slate-900 border-indigo-500/10 text-slate-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              To customize your profile and receive real email digests, please sign up.
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
                READ-ONLY
              </span>
            </div>
            <CardDescription className="text-slate-400">
              Choose how you want to be alerted of changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-indigo-500/5">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-slate-200">Email Alerts</Label>
                <p className="text-xs text-slate-400">Receive alerts immediately upon detected change.</p>
              </div>
              <input type="checkbox" defaultChecked disabled className="h-4 w-4 accent-indigo-500 opacity-60" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-slate-200">Slack Notifications</Label>
                <p className="text-xs text-slate-400">Send summary alerts directly to a Slack channel.</p>
              </div>
              <input type="checkbox" disabled className="h-4 w-4 accent-indigo-500 opacity-60" />
            </div>
            <Button onClick={handleAction} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
