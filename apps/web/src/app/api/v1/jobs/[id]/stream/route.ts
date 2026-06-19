import { NextRequest } from 'next/server';
import IORedis from 'ioredis';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.REDIS_URL) {
    return new Response(JSON.stringify({ error: 'Redis URL not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redis = new IORedis(process.env.REDIS_URL);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to the check progress channel for this job ID
      const channel = `checkProgress_${id}`;
      
      try {
        await redis.subscribe(channel);
        
        redis.on('message', (chan, message) => {
          if (chan === channel) {
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
            
            // If completed or failed, close the connection
            const data = JSON.parse(message);
            if (['completed', 'failed', 'cancelled'].includes(data.status)) {
              cleanup();
            }
          }
        });
      } catch (err) {
        console.error('Redis SSE Subscription error:', err);
        controller.error(err);
        cleanup();
      }

      function cleanup() {
        redis.unsubscribe(channel).catch(() => {});
        redis.quit().catch(() => {});
        try {
          controller.close();
        } catch (e) {}
      }

      req.signal.addEventListener('abort', () => {
        cleanup();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
