import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key' });

// ─── Circuit Breaker ────────────────────────────────────────────────────────

let circuitFailures = 0;
const CIRCUIT_THRESHOLD = 5;
let circuitResetTimer: ReturnType<typeof setTimeout> | null = null;

function openCircuit() {
  circuitFailures++;
  if (!circuitResetTimer) {
    circuitResetTimer = setTimeout(() => {
      circuitFailures = 0;
      circuitResetTimer = null;
    }, 60_000);
  }
}

// ─── AI Types ───────────────────────────────────────────────────────────────

export interface AiEnrichmentResult {
  summary: string;
  keyChanges: string[];
  businessImpact: string;
  recommendation: string;
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an elite competitive intelligence analyst. You monitor competitor websites 
for businesses and deliver concise, actionable insights.

You receive:
1. URL label and page category
2. Lines that were REMOVED from the page (before)
3. Lines that were ADDED to the page (after)

Respond with ONLY a valid JSON object — no markdown, no explanation:
{
  "summary": "2-3 sentence plain English summary of what changed. Be specific.",
  "key_changes": ["Change 1", "Change 2"],
  "business_impact": "1-2 sentences on competitive significance.",
  "recommended_action": "One concrete action to take right now."
}

Rules:
- Focus exclusively on what CHANGED, not what stayed the same
- Call out specific numbers (prices, percentages, feature names)
- If a free tier was removed or added, lead with that
- Avoid jargon. Write like you're texting a colleague.
- Summary must be under 80 words.
- key_changes: max 5 items, max 15 words each.`;

export function buildAiPrompt(params: {
  label: string;
  category: string;
  addedLines: string[];
  removedLines: string[];
}): string {
  const removed = params.removedLines.slice(0, 50).join('\n');
  const added = params.addedLines.slice(0, 50).join('\n');

  return `URL: ${params.label}
Category: ${params.category}

REMOVED LINES (what disappeared):
${removed || '(none)'}

ADDED LINES (what appeared):
${added || '(none)'}

Analyze the change and respond with JSON.`.trim();
}

// ─── Main Call ────────────────────────────────────────────────────────────────

export async function callAiEnrichment(
  prompt: string,
): Promise<AiEnrichmentResult> {
  if (circuitFailures >= CIRCUIT_THRESHOLD) {
    throw new Error('AI circuit breaker OPEN — skipping enrichment');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 400,
    });

    const raw = response.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw);

    // Reset on success
    circuitFailures = 0;
    if (circuitResetTimer) {
      clearTimeout(circuitResetTimer);
      circuitResetTimer = null;
    }

    return {
      summary: parsed.summary ?? '',
      keyChanges: Array.isArray(parsed.key_changes) ? parsed.key_changes : [],
      businessImpact: parsed.business_impact ?? '',
      recommendation: parsed.recommended_action ?? '',
    };
  } catch (error) {
    openCircuit();
    throw error;
  }
}
