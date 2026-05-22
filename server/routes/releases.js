const router = require('express').Router();
const pool = require('../db');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

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
    const countResult = await pool.query('SELECT COUNT(*) FROM releases');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM releases ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get releases error:', err);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM releases WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get release error:', err);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { version, name, description, status, release_date, features_count, bug_fixes_count, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO releases (version, name, description, status, release_date, features_count, bug_fixes_count, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [version, name, description, status, release_date, features_count, bug_fixes_count, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create release error:', err);
    res.status(500).json({ error: 'Failed to create release' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { version, name, description, status, release_date, features_count, bug_fixes_count, notes } = req.body;
    const result = await pool.query(
      `UPDATE releases SET version=$1, name=$2, description=$3, status=$4, release_date=$5, features_count=$6, bug_fixes_count=$7, notes=$8
       WHERE id=$9 RETURNING *`,
      [version, name, description, status, release_date, features_count, bug_fixes_count, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update release error:', err);
    res.status(500).json({ error: 'Failed to update release' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM releases WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json({ message: 'Release deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete release error:', err);
    res.status(500).json({ error: 'Failed to delete release' });
  }
});

// POST /api/releases/:id/ai-generate-notes - AI release notes generator
router.post('/:id/ai-generate-notes', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const releaseResult = await pool.query('SELECT * FROM releases WHERE id = $1', [id]);
    if (releaseResult.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    const release = releaseResult.rows[0];

    // Get completed stories for this release via sprint (heuristic: stories Done/Completed)
    const storiesResult = await pool.query(
      `SELECT title, description, acceptance_criteria, story_points, priority
       FROM user_stories
       WHERE status IN ('Done', 'Completed', 'done', 'completed')
       ORDER BY priority, story_points DESC
       LIMIT 30`
    );
    const stories = storiesResult.rows;

    // Get recent bug fixes from risks table (resolved)
    const risksResult = await pool.query(
      `SELECT title, mitigation FROM risks WHERE status IN ('Resolved', 'Accepted') LIMIT 10`
    );
    const resolvedRisks = risksResult.rows;

    const systemPrompt = `You are a technical writer specializing in software release notes. Return ONLY valid JSON in this exact structure:
{
  "version": "string",
  "release_date": "string",
  "headline": "string",
  "summary": "string",
  "new_features": [
    {
      "title": "string",
      "description": "string",
      "impact": "High|Medium|Low"
    }
  ],
  "improvements": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "bug_fixes": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "breaking_changes": ["string"],
  "migration_notes": "string",
  "acknowledgements": "string"
}`;

    const userPrompt = `Generate release notes for:
Release: ${release.version} - ${release.name}
Description: ${release.description || ''}
Release date: ${release.release_date || 'TBD'}
Features count: ${release.features_count || 0}
Bug fixes count: ${release.bug_fixes_count || 0}

Completed stories:
${JSON.stringify(stories.slice(0, 20), null, 2)}

Resolved issues:
${JSON.stringify(resolvedRisks, null, 2)}

Notes: ${release.notes || ''}`;

    const content = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);

    // Store in ai_results
    try {
      await pool.query(
        `INSERT INTO ai_results (user_id, endpoint, entity_id, entity_type, result, result_json, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [req.user?.userId || req.user?.id, 'release-notes', parseInt(id), 'release', content, parsed ? JSON.stringify(parsed) : null]
      );
    } catch (dbErr) { console.error('Failed to persist AI result:', dbErr.message); }

    // Update release notes field
    if (parsed) {
      try {
        const notesText = `${parsed.headline}\n\n${parsed.summary}`;
        await pool.query('UPDATE releases SET notes = $1 WHERE id = $2', [notesText, id]);
      } catch (dbErr) { console.error('Failed to update release notes:', dbErr.message); }
    }

    res.json({ content, parsed, release });
  } catch (err) {
    console.error('Release notes AI error:', err);
    res.status(500).json({ error: 'AI release notes generation failed', details: err.message });
  }
});

module.exports = router;
