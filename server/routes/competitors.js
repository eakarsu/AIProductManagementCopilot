const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM competitors ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get competitors error:', err);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM competitors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Competitor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get competitor error:', err);
    res.status(500).json({ error: 'Failed to fetch competitor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, website, market_share, strengths, weaknesses, pricing, threat_level } = req.body;
    const result = await pool.query(
      `INSERT INTO competitors (name, description, website, market_share, strengths, weaknesses, pricing, threat_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, website, market_share, strengths, weaknesses, pricing, threat_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create competitor error:', err);
    res.status(500).json({ error: 'Failed to create competitor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, website, market_share, strengths, weaknesses, pricing, threat_level } = req.body;
    const result = await pool.query(
      `UPDATE competitors SET name=$1, description=$2, website=$3, market_share=$4, strengths=$5, weaknesses=$6, pricing=$7, threat_level=$8
       WHERE id=$9 RETURNING *`,
      [name, description, website, market_share, strengths, weaknesses, pricing, threat_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Competitor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update competitor error:', err);
    res.status(500).json({ error: 'Failed to update competitor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM competitors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Competitor not found' });
    res.json({ message: 'Competitor deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete competitor error:', err);
    res.status(500).json({ error: 'Failed to delete competitor' });
  }
});

module.exports = router;
