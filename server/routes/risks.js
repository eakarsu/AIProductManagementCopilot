const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM risks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get risks error:', err);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM risks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get risk error:', err);
    res.status(500).json({ error: 'Failed to fetch risk' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, probability, impact, risk_score, mitigation, owner, status, category } = req.body;
    const result = await pool.query(
      `INSERT INTO risks (title, description, probability, impact, risk_score, mitigation, owner, status, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, probability, impact, risk_score, mitigation, owner, status, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create risk error:', err);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, probability, impact, risk_score, mitigation, owner, status, category } = req.body;
    const result = await pool.query(
      `UPDATE risks SET title=$1, description=$2, probability=$3, impact=$4, risk_score=$5, mitigation=$6, owner=$7, status=$8, category=$9
       WHERE id=$10 RETURNING *`,
      [title, description, probability, impact, risk_score, mitigation, owner, status, category, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update risk error:', err);
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM risks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json({ message: 'Risk deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete risk error:', err);
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

module.exports = router;
