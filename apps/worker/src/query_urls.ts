import { db } from '@cct/db';

async function queryUrls() {
  console.log('--- Current Tracked URLs in Database ---');
  const urls = await db.trackedUrl.findMany({
    orderBy: { createdAt: 'desc' },
  });

  if (urls.length === 0) {
    console.log('No tracked URLs found.');
    return;
  }

  urls.forEach((u) => {
    console.log(`\nID:              ${u.id}`);
    console.log(`URL:             ${u.url}`);
    console.log(`Label:           ${u.label}`);
    console.log(`Status:          ${u.status}`);
    console.log(`Last Checked:    ${u.lastCheckedAt}`);
    console.log(`Last Changed:    ${u.lastChangedAt}`);
    console.log(`Consecutive Fail:${u.consecutiveFails}`);
  });
}

queryUrls().catch(console.error);
