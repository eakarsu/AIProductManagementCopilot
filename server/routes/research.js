const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM market_research');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM market_research ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get research error:', err);
    res.status(500).json({ error: 'Failed to fetch market research' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM market_research WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Research not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get research error:', err);
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, market_size, growth_rate, key_trends, target_segment, source, status } = req.body;
    const result = await pool.query(
      `INSERT INTO market_research (title, description, market_size, growth_rate, key_trends, target_segment, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, market_size, growth_rate, key_trends, target_segment, source, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create research error:', err);
    res.status(500).json({ error: 'Failed to create research' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, market_size, growth_rate, key_trends, target_segment, source, status } = req.body;
    const result = await pool.query(
      `UPDATE market_research SET title=$1, description=$2, market_size=$3, growth_rate=$4, key_trends=$5, target_segment=$6, source=$7, status=$8
       WHERE id=$9 RETURNING *`,
      [title, description, market_size, growth_rate, key_trends, target_segment, source, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Research not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update research error:', err);
    res.status(500).json({ error: 'Failed to update research' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM market_research WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Research not found' });
    res.json({ message: 'Research deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete research error:', err);
    res.status(500).json({ error: 'Failed to delete research' });
  }
});

module.exports = router;
