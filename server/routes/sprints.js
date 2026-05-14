const router = require('express').Router();
const pool = require('../db');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3-5-sonnet-20241022';

function parseAIJson(content) {
  try { return JSON.parse(content); } catch (_) {}
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {} }
  const objMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objMatch) { try { return JSON.parse(objMatch[1]); } catch (_) {} }
  return null;
}

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

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM sprints');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM sprints ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get sprints error:', err);
    res.status(500).json({ error: 'Failed to fetch sprints' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sprints WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get sprint error:', err);
    res.status(500).json({ error: 'Failed to fetch sprint' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, goal, status, start_date, end_date, capacity, velocity } = req.body;
    const result = await pool.query(
      `INSERT INTO sprints (name, goal, status, start_date, end_date, capacity, velocity)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, goal, status, start_date, end_date, capacity, velocity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create sprint error:', err);
    res.status(500).json({ error: 'Failed to create sprint' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, goal, status, start_date, end_date, capacity, velocity } = req.body;
    const result = await pool.query(
      `UPDATE sprints SET name=$1, goal=$2, status=$3, start_date=$4, end_date=$5, capacity=$6, velocity=$7
       WHERE id=$8 RETURNING *`,
      [name, goal, status, start_date, end_date, capacity, velocity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update sprint error:', err);
    res.status(500).json({ error: 'Failed to update sprint' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM sprints WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    res.json({ message: 'Sprint deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete sprint error:', err);
    res.status(500).json({ error: 'Failed to delete sprint' });
  }
});

// GET /api/sprints/:id/velocity - compute story points completed vs planned
router.get('/:id/velocity', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const sprintResult = await pool.query('SELECT * FROM sprints WHERE id = $1', [id]);
    if (sprintResult.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    const sprint = sprintResult.rows[0];

    // Get all user stories in this sprint
    const storiesResult = await pool.query(
      'SELECT story_points, status FROM user_stories WHERE sprint_id = $1',
      [id]
    );
    const stories = storiesResult.rows;

    const planned = stories.reduce((sum, s) => sum + (parseInt(s.story_points) || 0), 0);
    const completed = stories
      .filter(s => s.status && ['Done', 'Completed', 'done', 'completed'].includes(s.status))
      .reduce((sum, s) => sum + (parseInt(s.story_points) || 0), 0);

    const velocity = planned > 0 ? Math.round((completed / planned) * 100) : 0;

    // Store computed velocity in sprint record
    await pool.query(
      'UPDATE sprints SET velocity = $1 WHERE id = $2',
      [completed, id]
    );

    res.json({
      sprint_id: parseInt(id),
      sprint_name: sprint.name,
      planned_points: planned,
      completed_points: completed,
      completion_rate: velocity,
      total_stories: stories.length,
      completed_stories: stories.filter(s => s.status && ['Done', 'Completed', 'done', 'completed'].includes(s.status)).length,
    });
  } catch (err) {
    console.error('Velocity error:', err);
    res.status(500).json({ error: 'Failed to compute velocity', details: err.message });
  }
});

// POST /api/sprints/:id/ai-plan - AI sprint planning assistant
router.post('/:id/ai-plan', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const sprintResult = await pool.query('SELECT * FROM sprints WHERE id = $1', [id]);
    if (sprintResult.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    const sprint = sprintResult.rows[0];

    // Fetch backlog stories (not yet in a sprint or in this sprint)
    const backlogResult = await pool.query(
      `SELECT id, title, description, story_points, priority, status
       FROM user_stories
       WHERE sprint_id IS NULL OR sprint_id = $1
       ORDER BY
         CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
         story_points ASC NULLS LAST
       LIMIT 50`,
      [id]
    );
    const backlogStories = backlogResult.rows;

    // Fetch team capacity for this sprint
    const capacityResult = await pool.query(
      'SELECT SUM(allocated_hours) as total_hours, COUNT(*) as team_size FROM team_capacity WHERE sprint_id = $1',
      [id]
    );
    const capacity = capacityResult.rows[0];

    const systemPrompt = `You are an expert agile coach and sprint planning assistant. Return ONLY valid JSON in this exact structure:
{
  "recommended_stories": [
    {
      "story_id": 1,
      "title": "string",
      "story_points": 3,
      "priority": "High",
      "reason": "string"
    }
  ],
  "excluded_stories": [
    {
      "story_id": 2,
      "title": "string",
      "reason": "why excluded"
    }
  ],
  "sprint_summary": {
    "total_recommended_points": 21,
    "capacity_utilization": "85%",
    "risk_level": "Low",
    "focus_areas": ["string"]
  },
  "recommendations": ["string"],
  "warnings": ["string"]
}`;

    const userPrompt = `Plan sprint: ${sprint.name}
Goal: ${sprint.goal || 'Not set'}
Capacity: ${sprint.capacity || 'Unknown'} story points
Team hours available: ${capacity.total_hours || 'Unknown'}, Team size: ${capacity.team_size}

Available backlog stories:
${JSON.stringify(backlogStories, null, 2)}

Recommend which stories to include based on priority, story points, and sprint capacity.`;

    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);

    // Save AI result
    try {
      await pool.query(
        `INSERT INTO ai_results (user_id, endpoint, entity_id, entity_type, result, result_json, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [req.user?.userId || req.user?.id, 'sprint-ai-plan', parseInt(id), 'sprint', content, parsed ? JSON.stringify(parsed) : null]
      );
    } catch (dbErr) { console.error('Failed to persist AI result:', dbErr.message); }

    res.json({ content, parsed, sprint });
  } catch (err) {
    console.error('Sprint AI plan error:', err);
    res.status(500).json({ error: 'AI sprint planning failed', details: err.message });
  }
});

module.exports = router;
