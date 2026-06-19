import { prisma } from '@cct/db';
// @ts-ignore — no types for robots-parser
import robotsParser from 'robots-parser';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function checkRobotsTxt(url: string, userAgent = 'CCT-Bot'): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    const robotsUrl = `${parsed.protocol}//${domain}/robots.txt`;

    // Cache hit
    const cached = await prisma.robotsTxtCache.findUnique({
      where: { domain },
    });

    if (cached && cached.expiresAt > new Date()) {
      const robots = robotsParser(robotsUrl, cached.content);
      return robots.isAllowed(url, userAgent) ?? true;
    }

    // Cache miss — fetch with 5s timeout
    try {
      const response = await fetch(robotsUrl, {
        signal: AbortSignal.timeout(5_000),
        headers: { 'User-Agent': userAgent },
      });
      const content = response.ok ? await response.text() : '';
      const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

      await prisma.robotsTxtCache.upsert({
        where: { domain },
        create: { domain, content, expiresAt },
        update: { content, fetchedAt: new Date(), expiresAt },
      });

      const robots = robotsParser(robotsUrl, content);
      return robots.isAllowed(url, userAgent) ?? true;
    } catch {
      // Unreachable robots.txt → assume allowed (fail open)
      return true;
    }
  } catch {
    // Invalid URL — fail open
    return true;
  }
}
