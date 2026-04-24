const router = require('express').Router();
const fetch = require('node-fetch');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(systemPrompt, userPrompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// POST /api/ai/generate - Generic AI generation
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context, feature } = req.body;
    const systemPrompt = `You are an expert AI Product Management assistant. You help product managers with strategy, planning, and execution. ${context ? `Context: ${context}` : ''} ${feature ? `Feature area: ${feature}` : ''}`;
    const content = await callOpenRouter(systemPrompt, prompt);
    res.json({ content });
  } catch (err) {
    console.error('AI generate error:', err);
    res.status(500).json({ error: 'AI generation failed', details: err.message });
  }
});

// POST /api/ai/prioritize - AI feature prioritization
router.post('/prioritize', async (req, res) => {
  try {
    const { features, criteria } = req.body;
    const systemPrompt = 'You are an expert product manager specializing in feature prioritization. Use frameworks like RICE (Reach, Impact, Confidence, Effort), MoSCoW, or Kano model to prioritize features. Provide a clear ranked list with justification for each feature\'s priority. Return structured analysis with scores and recommendations.';
    const userPrompt = `Please prioritize these features:\n${JSON.stringify(features, null, 2)}\n${criteria ? `Criteria to consider: ${criteria}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ content });
  } catch (err) {
    console.error('AI prioritize error:', err);
    res.status(500).json({ error: 'AI prioritization failed', details: err.message });
  }
});

// POST /api/ai/generate-stories - AI user story generation
router.post('/generate-stories', async (req, res) => {
  try {
    const { feature, context, persona } = req.body;
    const systemPrompt = 'You are an expert product manager who writes clear, actionable user stories. Generate user stories in the format "As a [persona], I want [goal], so that [benefit]". Include acceptance criteria for each story. Make stories specific, testable, and estimable. Group stories by theme when appropriate.';
    const userPrompt = `Generate user stories for: ${feature}\n${context ? `Context: ${context}` : ''}\n${persona ? `Primary persona: ${persona}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ content });
  } catch (err) {
    console.error('AI generate stories error:', err);
    res.status(500).json({ error: 'AI story generation failed', details: err.message });
  }
});

// POST /api/ai/market-research - AI market research
router.post('/market-research', async (req, res) => {
  try {
    const { topic, industry, targetMarket } = req.body;
    const systemPrompt = 'You are a market research analyst with deep expertise in technology markets. Provide comprehensive market analysis including market size (TAM/SAM/SOM), growth trends, key players, customer segments, emerging opportunities, and potential threats. Use data-driven insights and cite industry frameworks.';
    const userPrompt = `Conduct market research on: ${topic}\n${industry ? `Industry: ${industry}` : ''}\n${targetMarket ? `Target market: ${targetMarket}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ content });
  } catch (err) {
    console.error('AI market research error:', err);
    res.status(500).json({ error: 'AI market research failed', details: err.message });
  }
});

// POST /api/ai/competitive-analysis - AI competitive analysis
router.post('/competitive-analysis', async (req, res) => {
  try {
    const { competitors, product, market } = req.body;
    const systemPrompt = 'You are a competitive intelligence analyst. Provide detailed competitive analysis including SWOT analysis, feature comparison matrices, positioning maps, pricing analysis, and strategic recommendations. Identify competitive advantages and gaps.';
    const userPrompt = `Analyze the competitive landscape:\nCompetitors: ${JSON.stringify(competitors)}\n${product ? `Our product: ${product}` : ''}\n${market ? `Market: ${market}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ content });
  } catch (err) {
    console.error('AI competitive analysis error:', err);
    res.status(500).json({ error: 'AI competitive analysis failed', details: err.message });
  }
});

// POST /api/ai/analyze-feedback - AI feedback analysis
router.post('/analyze-feedback', async (req, res) => {
  try {
    const { feedback, productArea } = req.body;
    const systemPrompt = 'You are a customer insights analyst specializing in product feedback analysis. Analyze customer feedback to identify themes, sentiment patterns, feature requests, pain points, and actionable insights. Categorize feedback by urgency and impact. Provide recommendations for product improvements.';
    const userPrompt = `Analyze this customer feedback:\n${JSON.stringify(feedback)}\n${productArea ? `Product area: ${productArea}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ content });
  } catch (err) {
    console.error('AI analyze feedback error:', err);
    res.status(500).json({ error: 'AI feedback analysis failed', details: err.message });
  }
});

// POST /api/ai/generate-prd - AI PRD generation
router.post('/generate-prd', async (req, res) => {
  try {
    const { feature, context, targetUsers, goals } = req.body;
    const systemPrompt = 'You are a senior product manager who writes comprehensive Product Requirements Documents (PRDs). Generate a detailed PRD that includes: Executive Summary, Problem Statement, Goals & Success Metrics, User Personas, User Stories, Functional Requirements, Non-Functional Requirements, Technical Considerations, Design Considerations, Release Criteria, Timeline, Risks & Mitigations, and Open Questions.';
    const userPrompt = `Generate a PRD for: ${feature}\n${context ? `Context: ${context}` : ''}\n${targetUsers ? `Target users: ${targetUsers}` : ''}\n${goals ? `Goals: ${goals}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ content });
  } catch (err) {
    console.error('AI generate PRD error:', err);
    res.status(500).json({ error: 'AI PRD generation failed', details: err.message });
  }
});

// POST /api/ai/assess-risk - AI risk assessment
router.post('/assess-risk', async (req, res) => {
  try {
    const { project, risks, context } = req.body;
    const systemPrompt = 'You are a risk management expert for product development. Assess risks using probability and impact matrices. For each risk, provide: risk description, probability (Low/Medium/High), impact (Low/Medium/High), risk score, mitigation strategies, contingency plans, and early warning indicators. Categorize risks as Technical, Market, Resource, Schedule, or External.';
    const userPrompt = `Assess risks for: ${project}\n${risks ? `Known risks: ${JSON.stringify(risks)}` : ''}\n${context ? `Context: ${context}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ content });
  } catch (err) {
    console.error('AI assess risk error:', err);
    res.status(500).json({ error: 'AI risk assessment failed', details: err.message });
  }
});

module.exports = router;
