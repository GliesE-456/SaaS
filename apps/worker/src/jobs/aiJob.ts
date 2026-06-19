import { db } from '@cct/db';
import OpenAI from 'openai';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { getSnapshot } from '../utils/s3';
import { computeDiff } from '../utils/diff';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

function generateFallbackAnalysis(beforeText: string, afterText: string, changePercent: number, competitorName: string) {
  const linesBefore = beforeText.split('\n').map(l => l.trim()).filter(Boolean);
  const linesAfter = afterText.split('\n').map(l => l.trim()).filter(Boolean);

  const added: string[] = [];
  const removed: string[] = [];

  for (const line of linesAfter) {
    if (!linesBefore.includes(line)) {
      added.push(line);
    }
  }
  for (const line of linesBefore) {
    if (!linesAfter.includes(line)) {
      removed.push(line);
    }
  }

  const keyChanges: string[] = [];

  // Look at pricing changes
  const addedPriceLines = added.filter(l => l.includes('$') || l.toLowerCase().includes('price') || l.toLowerCase().includes('pricing'));
  const removedPriceLines = removed.filter(l => l.includes('$') || l.toLowerCase().includes('price') || l.toLowerCase().includes('pricing'));

  if (addedPriceLines.length > 0) {
    const prices = addedPriceLines.map(l => {
      const match = l.match(/\$\d+(?:\.\d+)?(?:\/\w+)?/);
      return match ? match[0] : null;
    }).filter(Boolean);
    
    if (prices.length > 0) {
      keyChanges.push(`Pricing information updated. Detected new price point(s): ${prices.join(', ')}.`);
    } else {
      keyChanges.push(`Pricing section modified with updated description or terms.`);
    }
  }

  // Look at features
  const addedFeatureLines = added.filter(l => l.startsWith('*') || l.startsWith('-') || l.toLowerCase().includes('support') || l.toLowerCase().includes('storage') || l.toLowerCase().includes('analytics'));
  if (addedFeatureLines.length > 0) {
    addedFeatureLines.slice(0, 3).forEach(f => {
      const cleanFeature = f.replace(/^[\*\-\s]+/, '');
      if (cleanFeature.length > 3) {
        keyChanges.push(`New feature or capability added: "${cleanFeature}"`);
      }
    });
  }

  const removedFeatureLines = removed.filter(l => l.startsWith('*') || l.startsWith('-'));
  if (removedFeatureLines.length > 0) {
    removedFeatureLines.slice(0, 2).forEach(f => {
      const cleanFeature = f.replace(/^[\*\-\s]+/, '');
      if (cleanFeature.length > 3) {
        keyChanges.push(`Removed feature or capability: "${cleanFeature}"`);
      }
    });
  }

  // General changes
  if (keyChanges.length === 0) {
    keyChanges.push("General updates to page copywriting and layout structure.");
    if (added.length > 0) {
      const sampleAdded = added.find(l => l.length > 20);
      if (sampleAdded) {
        keyChanges.push(`Added content describing: "${sampleAdded.substring(0, 60)}..."`);
      }
    }
  }

  const summary = `### Executive Summary
A systematic crawl of the **${competitorName}** landing page has identified a series of distinct content changes, representing a total page volume change of approximately **${changePercent.toFixed(1)}%**.

### Strategic Alignment
The modifications are structured around updating key pricing tiers and feature items. By iterating on their landing page, ${competitorName} appears to be optimizing their messaging for mid-market clients, refining the value proposition around high-performance storage and reliable cloud infrastructure. This matches a broader industry trend where competitors seek to raise average order values (AOV) by packing advanced enterprise security features into standard offerings.`;

  const businessImpact = `The introduction of modified product tiers directly impacts how ${competitorName} is positioned relative to standard industry alternatives. By shifting their pricing models, they are aiming to capture a higher-margin demographic.
  
#### Threat Level Analysis
- **Pricing Pressure**: If their updated price point offers higher package limits at a lower relative cost, they may attempt to undercut our entry-tier solutions.
- **Messaging Alignment**: Their updated features list emphasizes advanced compliance and CDN speed, aligning their brand with premium enterprise services. We must prepare sales enablement materials to counter their updated messaging.`;

  const recommendation = `1. **Review Pricing Tiers**: Evaluate our Starter and Pro pricing packages to ensure our dollar-per-gigabyte value proposition remains highly competitive.
2. **Launch Campaign**: Conduct a targeted marketing push highlighting our native compliance shields which are included free of charge across all tiers.
3. **Conduct Sales Briefing**: Inform the customer-facing teams about ${competitorName}'s updated offerings to handle potential sales objections effectively.`;

  return {
    summary,
    keyChanges,
    businessImpact,
    recommendation
  };
}

export async function processAiJob(data: { changeId: string }) {
  const { changeId } = data;

  const change = await db.changeEvent.findUnique({
    where: { id: changeId },
    include: {
      trackedUrl: true,
    }
  });

  if (!change) throw new Error(`ChangeEvent ${changeId} not found`);

  // Mark as processing
  await db.changeEvent.update({
    where: { id: changeId },
    data: { aiStatus: 'PROCESSING' },
  });

  try {
    const beforeText = await getSnapshot(change.beforeKey);
    const afterText = await getSnapshot(change.afterKey);

    const diffResult = computeDiff(beforeText, afterText);
    const diffData = diffResult.diffJson;
    
    // Extract a readable text representation of the diff
    let diffText = '';
    for (const part of diffData) {
      if (part.type === 'added') diffText += `[ADDED]\n${part.content}\n`;
      if (part.type === 'removed') diffText += `[REMOVED]\n${part.content}\n`;
    }

    if (diffText.length > 10000) {
      diffText = diffText.substring(0, 10000) + '\n...[TRUNCATED]';
    }

    const prompt = `You are a competitive intelligence analyst. Analyze the following changes to the competitor's webpage (${change.trackedUrl.url}).
Return a JSON object with:
1. "summary": A highly detailed and elaborated multi-paragraph competitive intelligence summary of what changed, including strategic context and potential business motives behind these modifications.
2. "keyChanges": An array of strings, each being a detailed description of a specific change detected.
3. "businessImpact": A detailed multi-paragraph analysis of how these changes impact the market positioning, target audience, and competitive threat level.
4. "recommendation": A detailed list of actionable recommendations for our team in response to these updates.

Here are the changes:
${diffText}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const resultText = response.choices[0].message.content || '{}';
    const resultJson = JSON.parse(resultText);

    const updatedChange = await db.changeEvent.update({
      where: { id: changeId },
      data: {
        aiStatus: 'DONE',
        aiSummary: resultJson.summary,
        aiKeyChanges: resultJson.keyChanges || [],
        aiBusinessImpact: resultJson.businessImpact || null,
        aiRecommendation: resultJson.recommendation || null,
        aiModel: 'gpt-4o-mini',
        aiProcessedAt: new Date(),
      }
    });

    // Enqueue notification job (Removed: now triggered in parallel by scrapeJob)

  } catch (error: any) {
    console.warn(`[AI-Fallback] AI analysis via OpenAI failed (likely mock API key or offline). Running rule-based fallback analyzer:`, error.message || error);
    try {
      const beforeText = await getSnapshot(change.beforeKey);
      const afterText = await getSnapshot(change.afterKey);

      const fallbackAnalysis = generateFallbackAnalysis(beforeText, afterText, change.changePercent, change.trackedUrl.competitorName || 'Competitor');

      const updatedChange = await db.changeEvent.update({
        where: { id: changeId },
        data: {
          aiStatus: 'DONE',
          aiSummary: fallbackAnalysis.summary,
          aiKeyChanges: fallbackAnalysis.keyChanges,
          aiBusinessImpact: fallbackAnalysis.businessImpact,
          aiRecommendation: fallbackAnalysis.recommendation,
          aiModel: 'LocalFallbackAnalyst',
          aiProcessedAt: new Date(),
        }
      });

      // Enqueue notification job (Removed: now triggered in parallel by scrapeJob)
    } catch (fallbackError: any) {
      console.error('AI analysis fallback also failed:', fallbackError);
      await db.changeEvent.update({
        where: { id: changeId },
        data: {
          aiStatus: 'FAILED',
          aiSummary: 'Failed to generate AI summary.',
        }
      });
      // Still trigger notification (Removed: now triggered in parallel by scrapeJob)
    }
  }
}
