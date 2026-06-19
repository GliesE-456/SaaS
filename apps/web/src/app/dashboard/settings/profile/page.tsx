import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { db, BRANDING } from '@cct/db';

export const metadata: Metadata = {
  title: `Profile Settings | ${BRANDING.name}`,
  description: 'Manage your profile and notification preferences',
};

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session || !session.user || !(session as any).workspace) return null;

  const workspaceId = (session as any).workspace.id;

  const prefs = await db.notificationPreference.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id!,
        workspaceId,
      }
    }
  });

  const emailEnabled = prefs ? prefs.emailEnabled : true;
  const emailDigest = prefs ? prefs.emailDigest : 'IMMEDIATE';

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-4xl">
      <PageHeader
        heading="Profile Settings"
        text="Manage your account details and notification preferences."
      />
      
      <div className="grid gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your basic account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={session.user.name || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={session.user.email || ''} disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              To update your name or email, please contact support.
            </p>
          </CardContent>
        </Card>

        <NotificationSettings 
          initialEnabled={emailEnabled} 
          initialDigest={emailDigest} 
        />
      </div>
    </div>
  );
}
