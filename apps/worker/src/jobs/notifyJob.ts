import { db } from '@cct/db';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { ChangeAlertEmail } from '../emails/ChangeAlertEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function processNotifyJob(data: { changeId: string }) {
  const { changeId } = data;

  const change = await db.changeEvent.findUnique({
    where: { id: changeId },
    include: {
      trackedUrl: {
        include: {
          workspace: {
            include: {
              owner: true,
            }
          }
        }
      }
    }
  });

  if (!change) throw new Error(`ChangeEvent ${changeId} not found`);

  const workspace = change.trackedUrl.workspace;
  const owner = workspace.owner;

  // Retrieve notification preferences for the owner in this workspace
  const prefs = await db.notificationPreference.findUnique({
    where: {
      userId_workspaceId: {
        userId: owner.id,
        workspaceId: workspace.id,
      }
    }
  });

  // Check user notification settings
  const emailEnabled = prefs ? prefs.emailEnabled : true;
  const emailDigest = prefs ? prefs.emailDigest : 'IMMEDIATE';

  if (!emailEnabled) return; // User opted out of all emails

  if (emailDigest !== 'IMMEDIATE') {
    // If Daily or Weekly, we skip sending here.
    // A separate cron job will collect all changes for the workspace/user and send a digest.
    return;
  }

  const aiSummaryText = change.aiSummary ? change.aiSummary : 'AI analysis is loading in your dashboard...';
  const urlLabel = change.trackedUrl.competitorName || change.trackedUrl.label || change.trackedUrl.url;

  try {
    const html = await render(
      ChangeAlertEmail({
        workspaceId: workspace.id,
        urlId: change.trackedUrl.id,
        changeEventId: change.id,
        competitorName: change.trackedUrl.competitorName || 'Competitor',
        pageLabel: change.trackedUrl.label || change.trackedUrl.url,
        impactLevel: change.impactLevel || 'MEDIUM',
        diffSummary: aiSummaryText,
        dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      })
    );

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'alerts@competitortracker.io',
      to: owner.email,
      subject: `[CCT Alert] Change detected on ${urlLabel}`,
      html,
    });
    console.log(`Sent styled notification for change ${changeId} to ${owner.email}`);
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}
