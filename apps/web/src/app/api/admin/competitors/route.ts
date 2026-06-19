import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';
import { Queue } from 'bullmq';

const DEFAULT_COMPETITORS = [
  {
    id: 'competitor-alpha',
    name: 'Alpha Cloud',
    pricing: '$29/month',
    description: 'The premier cloud platform for modern software development. Scale your infrastructure effortlessly with our distributed network.',
    features: 'Unlimited Projects\n24/7 Priority Support\nAdvanced Analytics Dashboard\n100GB High-speed Storage\nGlobal Edge CDN',
    ctaText: 'Start Free Trial',
  },
  {
    id: 'competitor-beta',
    name: 'BetaFlow Automation',
    pricing: '$49/month',
    description: 'BetaFlow is the ultimate workflow automation tool for growing teams. Streamline your tasks and sync your tools seamlessly.',
    features: '10 Active Workflows\nSlack & Webhook Integrations\nBasic Reports & Exporting\nStandard Email Support\nDaily Automated Syncs',
    ctaText: 'Get Started Now',
  },
  {
    id: 'competitor-gamma',
    name: 'Gamma Security',
    pricing: '$199/month',
    description: 'Gamma Security offers next-generation enterprise cybersecurity, threat monitoring, and zero-trust remote access solutions.',
    features: 'Enterprise SSO & SAML\nCustom Firewalls & WAF\nDedicated Support Engineer\nAudit Logs & SOC2 Compliance\n24/7 Threat Hunting',
    ctaText: 'Contact Sales',
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let competitors = await db.demoCompetitor.findMany({
      orderBy: { id: 'asc' },
    });

    if (competitors.length === 0) {
      // Seed default competitors
      await Promise.all(
        DEFAULT_COMPETITORS.map((c) =>
          db.demoCompetitor.create({
            data: c,
          })
        )
      );
      competitors = await db.demoCompetitor.findMany({
        orderBy: { id: 'asc' },
      });
    }

    return NextResponse.json({ data: competitors });
  } catch (error) {
    console.error('GET /api/admin/competitors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;
    const body = await req.json();

    const { id, name, pricing, description, features, ctaText, triggerCheck } = body;

    if (!id || !name || !pricing || !description || !features || !ctaText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update Competitor page content
    const updatedCompetitor = await db.demoCompetitor.upsert({
      where: { id },
      update: {
        name,
        pricing,
        description,
        features,
        ctaText,
      },
      create: {
        id,
        name,
        pricing,
        description,
        features,
        ctaText,
      },
    });

    let jobId: string | null = null;
    let trackedUrlId: string | null = null;

    // 2. Trigger check if requested
    if (triggerCheck) {
      const urlObj = new URL(req.url);
      const competitorUrl = `${urlObj.origin}/demo/${id}`;

      // Find or create TrackedUrl in this workspace
      let trackedUrl = await db.trackedUrl.findFirst({
        where: {
          workspaceId,
          url: competitorUrl,
        },
      });

      if (!trackedUrl) {
        trackedUrl = await db.trackedUrl.create({
          data: {
            workspaceId,
            url: competitorUrl,
            label: `${name} (Demo)`,
            competitorName: name,
            category: 'PRODUCT',
            checkFrequency: 'DAILY',
            noiseThreshold: 0.1, // set low noise threshold for simple trigger detection
          },
        });
      }

      trackedUrlId = trackedUrl.id;

      // Enqueue manual scraper job
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const scrapeQueue = new Queue('scrapeQueue', {
        connection: {
          url: redisUrl,
        } as any,
      });

      const job = await scrapeQueue.add(
        'manualCheck',
        { trackedUrlId: trackedUrl.id },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );

      jobId = job.id || null;
      await scrapeQueue.close();
    }

    return NextResponse.json({
      data: updatedCompetitor,
      triggered: !!triggerCheck,
      jobId,
      trackedUrlId,
    });
  } catch (error) {
    console.error('POST /api/admin/competitors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
