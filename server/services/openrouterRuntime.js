'use strict';

const fetch = require('node-fetch');

async function callOpenRouter(input) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
  if (!apiKey || !model || !baseUrl) throw new Error('OpenRouter runtime configuration is required');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a concise product-management copilot. Give an actionable, evidence-aware brief.' },
        { role: 'user', content: JSON.stringify(input) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter request failed with HTTP ${response.status}`);
  const payload = await response.json();
  const content = String(payload?.choices?.[0]?.message?.content || '').trim();
  if (!content) throw new Error('OpenRouter returned empty content');
  return { content, model: payload.model || model };
}

module.exports = { callOpenRouter };
