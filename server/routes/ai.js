const router = require('express').Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const pool = require('../db');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3-5-sonnet-20241022';

// AI rate limiter: 20 requests per hour per user
const aiRateLimitStore = new Map();
function aiRateLimiter(req, res, next) {
  const userId = req.user?.userId || req.user?.id || req.ip;
  const key = `ai:${userId}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 20;

  let record = aiRateLimitStore.get(key);
  if (!record || now - record.windowStart > windowMs) {
    record = { count: 0, windowStart: now };
    aiRateLimitStore.set(key, record);
  }
  record.count++;

  res.set('X-RateLimit-Limit', String(maxRequests));
  res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - record.count)));

  if (record.count > maxRequests) {
    return res.status(429).json({ error: 'AI rate limit exceeded. Max 20 requests per hour.' });
  }
  next();
}

// Clean up rate limit store every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of aiRateLimitStore.entries()) {
    if (now - data.windowStart > 60 * 60 * 1000) aiRateLimitStore.delete(key);
  }
}, 30 * 60 * 1000);

// Apply auth and rate limiting to ALL AI routes
router.use(auth);
router.use(aiRateLimiter);

async function callOpenRouter(systemPrompt, userPrompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: MODEL,
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

// 3-strategy JSON parser
function parseAIJson(content) {
  // Strategy 1: direct JSON parse
  try {
    return JSON.parse(content);
  } catch (_) {}

  // Strategy 2: extract JSON block from markdown code fences
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {}
  }

  // Strategy 3: extract first {...} or [...] block
  const objMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[1]);
    } catch (_) {}
  }

  return null;
}

async function persistAIResult(userId, endpoint, entityId, entityType, content, parsedJson) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, entity_id, entity_type, result, result_json, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, endpoint, entityId || null, entityType || null, content, parsedJson ? JSON.stringify(parsedJson) : null]
    );
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

function getUserId(req) {
  return req.user?.userId || req.user?.id || null;
}

// POST /api/ai/generate - Generic AI generation
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context, feature } = req.body;
    const systemPrompt = `You are an expert AI Product Management assistant. You help product managers with strategy, planning, and execution. ${context ? `Context: ${context}` : ''} ${feature ? `Feature area: ${feature}` : ''}`;
    const content = await callOpenRouter(systemPrompt, prompt);
    await persistAIResult(getUserId(req), 'generate', null, null, content, null);
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
    const systemPrompt = `You are an expert product manager specializing in feature prioritization. Use RICE (Reach, Impact, Confidence, Effort), MoSCoW, and Kano frameworks. Return ONLY valid JSON in this exact structure:
{
  "prioritized": [
    {
      "feature_name": "string",
      "score": 85,
      "rank": 1,
      "rationale": "string",
      "framework_scores": {
        "rice": 90,
        "moscow": "Must Have",
        "kano": "Must-be"
      }
    }
  ]
}`;
    const userPrompt = `Please prioritize these features:\n${JSON.stringify(features, null, 2)}\n${criteria ? `Criteria to consider: ${criteria}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await persistAIResult(getUserId(req), 'prioritize', null, 'features', content, parsed);
    res.json({ content, parsed });
  } catch (err) {
    console.error('AI prioritize error:', err);
    res.status(500).json({ error: 'AI prioritization failed', details: err.message });
  }
});

// POST /api/ai/generate-stories - AI user story generation
router.post('/generate-stories', async (req, res) => {
  try {
    const { feature, context, persona, feature_id } = req.body;
    const systemPrompt = `You are an expert product manager who writes clear, actionable user stories. Return ONLY valid JSON in this exact structure:
{
  "stories": [
    {
      "title": "string",
      "user_role": "string",
      "action": "string",
      "benefit": "string",
      "acceptance_criteria": ["criterion 1", "criterion 2"],
      "story_points": 3,
      "priority": "High"
    }
  ]
}`;
    const userPrompt = `Generate user stories for: ${feature}\n${context ? `Context: ${context}` : ''}\n${persona ? `Primary persona: ${persona}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await persistAIResult(getUserId(req), 'generate-stories', feature_id || null, 'feature', content, parsed);

    // Auto-persist stories to DB if feature_id provided and parsing succeeded
    const createdStoryIds = [];
    if (feature_id && parsed?.stories && Array.isArray(parsed.stories)) {
      for (const story of parsed.stories) {
        try {
          const description = `As a ${story.user_role}, I want ${story.action}, so that ${story.benefit}`;
          const acceptanceCriteria = Array.isArray(story.acceptance_criteria)
            ? story.acceptance_criteria.join('\n')
            : story.acceptance_criteria || '';
          const result = await pool.query(
            `INSERT INTO user_stories (title, description, acceptance_criteria, story_points, priority, status, feature_id)
             VALUES ($1, $2, $3, $4, $5, 'Backlog', $6) RETURNING id`,
            [story.title, description, acceptanceCriteria, story.story_points || null, story.priority || 'Medium', feature_id]
          );
          createdStoryIds.push(result.rows[0].id);
        } catch (dbErr) {
          console.error('Failed to save story:', dbErr.message);
        }
      }
    }

    res.json({ content, parsed, createdStoryIds });
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
    await persistAIResult(getUserId(req), 'market-research', null, null, content, null);
    res.json({ content });
  } catch (err) {
    console.error('AI market research error:', err);
    res.status(500).json({ error: 'AI market research failed', details: err.message });
  }
});

// POST /api/ai/competitive-analysis - AI competitive analysis with structured JSON
router.post('/competitive-analysis', async (req, res) => {
  try {
    const { competitors, product, market, product_category } = req.body;
    const competitorList = competitors || [];
    const systemPrompt = `You are a competitive intelligence analyst. Return ONLY valid JSON in this exact structure:
{
  "matrix": [
    {
      "competitor": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "key_features": ["string"],
      "pricing": "string",
      "market_share": "string",
      "threat_level": "Low|Medium|High|Critical",
      "opportunities": ["string"]
    }
  ],
  "our_advantages": ["string"],
  "our_gaps": ["string"],
  "market_positioning": "string",
  "strategic_recommendations": ["string"],
  "swot": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "win_themes": ["string"],
  "differentiation_strategy": "string"
}`;
    const userPrompt = `Analyze the competitive landscape:\nCompetitors: ${JSON.stringify(competitorList)}\n${product ? `Our product: ${product}` : ''}\n${market ? `Market: ${market}` : ''}\n${product_category ? `Category: ${product_category}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await persistAIResult(getUserId(req), 'competitive-analysis', null, null, content, parsed);
    res.json({ content, parsed });
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
    await persistAIResult(getUserId(req), 'analyze-feedback', null, null, content, null);
    res.json({ content });
  } catch (err) {
    console.error('AI analyze feedback error:', err);
    res.status(500).json({ error: 'AI feedback analysis failed', details: err.message });
  }
});

// POST /api/ai/generate-prd - AI PRD generation
router.post('/generate-prd', async (req, res) => {
  try {
    const { feature, context, targetUsers, goals, feature_id } = req.body;
    const systemPrompt = `You are a senior product manager who writes comprehensive Product Requirements Documents (PRDs). Return ONLY valid JSON in this exact structure:
{
  "title": "string",
  "executive_summary": "string",
  "problem_statement": "string",
  "goals": ["goal 1", "goal 2"],
  "user_stories_summary": ["story 1", "story 2"],
  "success_metrics": ["metric 1", "metric 2"],
  "technical_requirements": ["req 1", "req 2"],
  "timeline": "string",
  "open_questions": ["question 1", "question 2"]
}`;
    const userPrompt = `Generate a PRD for: ${feature}\n${context ? `Context: ${context}` : ''}\n${targetUsers ? `Target users: ${targetUsers}` : ''}\n${goals ? `Goals: ${goals}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await persistAIResult(getUserId(req), 'generate-prd', feature_id || null, 'feature', content, parsed);

    // Store PRD in prd_documents table
    if (parsed) {
      try {
        await pool.query(
          `INSERT INTO prd_documents (feature_id, title, content_json, created_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT DO NOTHING`,
          [feature_id || null, parsed.title || feature, JSON.stringify(parsed)]
        );
      } catch (dbErr) {
        console.error('Failed to save PRD:', dbErr.message);
      }
    }

    res.json({ content, parsed });
  } catch (err) {
    console.error('AI generate PRD error:', err);
    res.status(500).json({ error: 'AI PRD generation failed', details: err.message });
  }
});

// POST /api/ai/assess-risk - AI risk assessment
router.post('/assess-risk', async (req, res) => {
  try {
    const { project, risks, context, project_id } = req.body;
    const systemPrompt = `You are a risk management expert for product development. Return ONLY valid JSON in this exact structure:
{
  "risks": [
    {
      "title": "string",
      "probability": 3,
      "impact": 4,
      "score": 12,
      "mitigation": "string",
      "owner": "string",
      "timeline": "string"
    }
  ]
}
Probability and impact are integers 1-5.`;
    const userPrompt = `Assess risks for: ${project}\n${risks ? `Known risks: ${JSON.stringify(risks)}` : ''}\n${context ? `Context: ${context}` : ''}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await persistAIResult(getUserId(req), 'assess-risk', project_id || null, 'project', content, parsed);

    // Auto-persist risks to DB
    if (parsed?.risks && Array.isArray(parsed.risks)) {
      for (const risk of parsed.risks) {
        try {
          const probMap = { 1: 'Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'High' };
          const impMap = { 1: 'Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'High' };
          await pool.query(
            `INSERT INTO risks (title, description, probability, impact, risk_score, mitigation, owner, status, category)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'Identified', 'AI Generated')`,
            [
              risk.title,
              `AI-assessed risk: ${risk.title}`,
              probMap[risk.probability] || 'Medium',
              impMap[risk.impact] || 'Medium',
              risk.score || (risk.probability * risk.impact),
              risk.mitigation || '',
              risk.owner || 'TBD'
            ]
          );
        } catch (dbErr) {
          console.error('Failed to save risk:', dbErr.message);
        }
      }
    }

    res.json({ content, parsed });
  } catch (err) {
    console.error('AI assess risk error:', err);
    res.status(500).json({ error: 'AI risk assessment failed', details: err.message });
  }
});

// POST /api/ai/competitive-analysis structured - override with structured JSON
// Already above at line 226, but now let's add the NEW structured version below history

// GET /api/ai/product-health - product health dashboard
router.get('/product-health', async (req, res) => {
  try {
    // Gather metrics from all tables
    const [storiesR, sprintsR, featuresR, risksR, metricsR, feedbackR, releasesR] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN (\'Done\',\'Completed\')) as done FROM user_stories'),
      pool.query('SELECT COUNT(*) as total, AVG(velocity) as avg_velocity, SUM(capacity) as total_capacity FROM sprints WHERE status != \'Cancelled\''),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'Shipped\') as shipped FROM features'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN (\'Identified\',\'Analyzing\',\'Mitigating\')) as open FROM risks'),
      pool.query('SELECT COUNT(*) as total FROM product_metrics'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE sentiment = \'Positive\') as positive, COUNT(*) FILTER (WHERE sentiment = \'Negative\') as negative FROM customer_feedback'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'Released\') as released FROM releases'),
    ]);

    const metrics = {
      stories: { total: parseInt(storiesR.rows[0].total), done: parseInt(storiesR.rows[0].done) },
      sprints: { total: parseInt(sprintsR.rows[0].total), avg_velocity: parseFloat(sprintsR.rows[0].avg_velocity) || 0 },
      features: { total: parseInt(featuresR.rows[0].total), shipped: parseInt(featuresR.rows[0].shipped) },
      risks: { total: parseInt(risksR.rows[0].total), open: parseInt(risksR.rows[0].open) },
      product_metrics: { total: parseInt(metricsR.rows[0].total) },
      feedback: {
        total: parseInt(feedbackR.rows[0].total),
        positive: parseInt(feedbackR.rows[0].positive),
        negative: parseInt(feedbackR.rows[0].negative),
      },
      releases: { total: parseInt(releasesR.rows[0].total), released: parseInt(releasesR.rows[0].released) },
    };

    const systemPrompt = `You are a product analytics expert. Analyze product health metrics and return ONLY valid JSON in this exact structure:
{
  "health_score": 78,
  "health_grade": "B+",
  "summary": "string",
  "strengths": ["string"],
  "concerns": ["string"],
  "velocity_trend": "Improving|Declining|Stable",
  "delivery_rate": 85,
  "risk_level": "Low|Medium|High",
  "recommendations": [
    {
      "priority": "High|Medium|Low",
      "action": "string",
      "impact": "string"
    }
  ],
  "key_metrics": {
    "story_completion_rate": 72,
    "feature_ship_rate": 45,
    "feedback_sentiment_score": 65,
    "risk_exposure": "Medium"
  }
}`;

    const userPrompt = `Analyze product health from these metrics:\n${JSON.stringify(metrics, null, 2)}`;
    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await persistAIResult(getUserId(req), 'product-health', null, 'product', content, parsed);

    res.json({ metrics, content, parsed });
  } catch (err) {
    console.error('Product health error:', err);
    res.status(500).json({ error: 'Product health assessment failed', details: err.message });
  }
});

// POST /api/ai/stakeholder-update - executive stakeholder update generator
router.post('/stakeholder-update', async (req, res) => {
  try {
    const { period, audience, highlights } = req.body;

    // Gather recent data
    const [sprintsR, storiesR, featuresR, releasesR, metricsR] = await Promise.all([
      pool.query('SELECT name, goal, status, velocity FROM sprints ORDER BY created_at DESC LIMIT 3'),
      pool.query('SELECT COUNT(*) as completed FROM user_stories WHERE status IN (\'Done\',\'Completed\')'),
      pool.query('SELECT COUNT(*) as shipped FROM features WHERE status = \'Shipped\''),
      pool.query('SELECT version, name, status, release_date FROM releases ORDER BY created_at DESC LIMIT 2'),
      pool.query('SELECT name, current_value, target_value, trend FROM product_metrics ORDER BY created_at DESC LIMIT 5'),
    ]);

    const projectData = {
      recent_sprints: sprintsR.rows,
      completed_stories: parseInt(storiesR.rows[0].completed),
      shipped_features: parseInt(featuresR.rows[0].shipped),
      recent_releases: releasesR.rows,
      key_metrics: metricsR.rows,
    };

    const systemPrompt = `You are an executive communications specialist. Generate a concise stakeholder update. Return ONLY valid JSON in this exact structure:
{
  "subject": "string",
  "executive_summary": "string",
  "key_achievements": ["string"],
  "metrics_highlights": [
    {
      "metric": "string",
      "value": "string",
      "trend": "Up|Down|Stable",
      "context": "string"
    }
  ],
  "upcoming_milestones": ["string"],
  "risks_and_blockers": ["string"],
  "decisions_needed": ["string"],
  "team_highlights": "string",
  "next_period_focus": "string"
}`;

    const userPrompt = `Generate stakeholder update for ${period || 'this sprint'} targeting ${audience || 'leadership'}:
Project data: ${JSON.stringify(projectData, null, 2)}
Additional highlights: ${highlights || 'None'}`;

    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await persistAIResult(getUserId(req), 'stakeholder-update', null, null, content, parsed);

    res.json({ content, parsed });
  } catch (err) {
    console.error('Stakeholder update error:', err);
    res.status(500).json({ error: 'Stakeholder update generation failed', details: err.message });
  }
});

// POST /api/ai/sentiment-analyze - sentiment-only analysis of feedback batch
router.post('/sentiment-analyze', async (req, res) => {
  try {
    const { feedback, source } = req.body;
    if (!feedback || (Array.isArray(feedback) && feedback.length === 0)) {
      return res.status(400).json({ error: 'feedback (string or array) is required' });
    }
    const items = Array.isArray(feedback) ? feedback : [feedback];

    const systemPrompt = 'You are a sentiment-analysis AI. Score each item, then aggregate. Return ONLY valid JSON.';
    const userPrompt = `Source: ${source || 'unknown'}

Items:
${items.map((it, i) => `${i + 1}. ${typeof it === 'string' ? it : JSON.stringify(it)}`).join('\n')}

Return JSON:
{
  "items": [{"index": 0, "sentiment": "negative|mixed|neutral|positive", "score": 0, "emotions": ["string"], "summary": "string"}],
  "aggregate": {"overall": "negative|mixed|neutral|positive", "score": 0, "negative_pct": 0, "positive_pct": 0},
  "themes": [{"theme": "string", "count": 0}],
  "recommendations": ["string"]
}`;

    const content = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult(getUserId(req), 'sentiment-analyze', null, 'feedback', content, null);
    res.json({ content, items_analyzed: items.length });
  } catch (err) {
    console.error('AI sentiment-analyze error:', err);
    res.status(500).json({ error: 'AI sentiment analysis failed', details: err.message });
  }
});

// POST /api/ai/metric-anomaly-detect - flag unusual metric movement
router.post('/metric-anomaly-detect', async (req, res) => {
  try {
    const { metric_id, metric_name, series, baseline_window } = req.body;

    let data = series;
    if (!data && metric_id) {
      try {
        const r = await pool.query(
          `SELECT recorded_at, value FROM metric_values WHERE metric_id = $1 ORDER BY recorded_at ASC LIMIT 500`,
          [metric_id]
        );
        data = r.rows;
      } catch (_) {}
    }

    const summary = (data || []).map(d => `${d.recorded_at || d.date || d.t}: ${d.value}`).join('\n');

    const systemPrompt = 'You are a product analytics anomaly detector. Identify spikes, drops, regressions, level shifts, and seasonality breaks. Return ONLY valid JSON.';
    const userPrompt = `Metric: ${metric_name || 'unknown'} (id=${metric_id || 'inline'})
Baseline Window: ${baseline_window || 'last 4 weeks'}

Series:
${summary || 'No data provided'}

Return JSON:
{
  "anomalies": [{"timestamp": "string", "value": 0, "type": "spike|drop|level_shift|seasonality_break", "severity": "low|medium|high|critical", "z_score_estimate": 0, "likely_cause": "string"}],
  "trend_summary": "string",
  "recommendations": ["string"]
}`;

    const content = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult(getUserId(req), 'metric-anomaly-detect', metric_id || null, 'metric', content, null);
    res.json({ content, points_analyzed: (data || []).length });
  } catch (err) {
    console.error('AI metric-anomaly-detect error:', err);
    res.status(500).json({ error: 'AI metric anomaly detection failed', details: err.message });
  }
});

// POST /api/ai/feature-impact-predict - predict business impact of a proposed feature
router.post('/feature-impact-predict', async (req, res) => {
  try {
    const { feature_id, feature, problem, target_users, current_metrics, alternatives, effort_estimate } = req.body;
    if (!feature && !feature_id) {
      return res.status(400).json({ error: 'feature description or feature_id is required' });
    }

    let featureRecord = null;
    if (feature_id && !feature) {
      try {
        const r = await pool.query('SELECT * FROM features WHERE id = $1', [feature_id]);
        featureRecord = r.rows[0] || null;
      } catch (_) {}
    }

    const systemPrompt = 'You are a senior PM analyst. Predict the business impact (engagement, retention, revenue) of a proposed feature with explicit assumptions and confidence. Return ONLY valid JSON.';
    const userPrompt = `Feature: ${feature || featureRecord?.title || 'unknown'}
Description: ${featureRecord?.description || ''}
Problem: ${problem || ''}
Target Users: ${target_users || ''}
Current Metrics: ${JSON.stringify(current_metrics || {})}
Alternatives Considered: ${JSON.stringify(alternatives || [])}
Effort Estimate: ${effort_estimate || 'unknown'}

Return JSON:
{
  "predicted_impact": {"engagement": "string", "retention": "string", "revenue": "string", "csat": "string"},
  "key_assumptions": ["string"],
  "ranked_kpis": [{"kpi": "string", "expected_change_pct": 0, "confidence": "low|medium|high"}],
  "risks": ["string"],
  "experiment_design": {"primary_metric": "string", "guardrail_metrics": ["string"], "duration_estimate": "string"},
  "recommendation": "build|defer|reject",
  "summary": "string"
}`;

    const content = await callOpenRouter(systemPrompt, userPrompt);
    await persistAIResult(getUserId(req), 'feature-impact-predict', feature_id || null, 'feature', content, null);
    res.json({ content });
  } catch (err) {
    console.error('AI feature-impact-predict error:', err);
    res.status(500).json({ error: 'AI feature-impact-predict failed', details: err.message });
  }
});

// GET /api/ai/history - paginated AI results for logged-in user
router.get('/history', async (req, res) => {
  try {
    const userId = getUserId(req);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_results WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, endpoint, entity_id, entity_type, created_at,
              LEFT(result, 200) as result_preview,
              result_json
       FROM ai_results WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      history: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('AI history error:', err);
    res.status(500).json({ error: 'Failed to fetch AI history', details: err.message });
  }
});

module.exports = router;
