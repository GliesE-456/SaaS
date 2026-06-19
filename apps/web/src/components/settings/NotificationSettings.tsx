'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { DigestFrequency } from '@cct/db';

interface NotificationSettingsProps {
  initialEnabled: boolean;
  initialDigest: DigestFrequency;
}

export function NotificationSettings({ initialEnabled, initialDigest }: NotificationSettingsProps) {
  const [emailEnabled, setEmailEnabled] = React.useState(initialEnabled);
  const [emailDigest, setEmailDigest] = React.useState<DigestFrequency>(initialDigest);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailEnabled, emailDigest }),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      
      toast({ title: 'Settings saved successfully' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = emailEnabled !== initialEnabled || emailDigest !== initialDigest;

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>
          Choose how and when you want to be notified about competitor changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Email Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when tracked pages change.
            </p>
          </div>
          <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
        </div>

        {emailEnabled && (
          <div className="space-y-3">
            <Label>Digest Frequency</Label>
            <Select value={emailDigest} onValueChange={(v) => setEmailDigest(v as DigestFrequency)}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMMEDIATE">Immediately (Per Change)</SelectItem>
                <SelectItem value="DAILY">Daily Summary</SelectItem>
                <SelectItem value="WEEKLY">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Note: Immediate alerts will be sent as soon as a change is detected. Daily and weekly digests are aggregated.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
