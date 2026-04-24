const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ab_tests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get ab tests error:', err);
    res.status(500).json({ error: 'Failed to fetch A/B tests' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ab_tests WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'A/B test not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get ab test error:', err);
    res.status(500).json({ error: 'Failed to fetch A/B test' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, hypothesis, variant_a, variant_b, metric, status, start_date, end_date, winner, results } = req.body;
    const result = await pool.query(
      `INSERT INTO ab_tests (name, hypothesis, variant_a, variant_b, metric, status, start_date, end_date, winner, results)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, hypothesis, variant_a, variant_b, metric, status, start_date, end_date, winner, results]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create ab test error:', err);
    res.status(500).json({ error: 'Failed to create A/B test' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, hypothesis, variant_a, variant_b, metric, status, start_date, end_date, winner, results } = req.body;
    const result = await pool.query(
      `UPDATE ab_tests SET name=$1, hypothesis=$2, variant_a=$3, variant_b=$4, metric=$5, status=$6, start_date=$7, end_date=$8, winner=$9, results=$10
       WHERE id=$11 RETURNING *`,
      [name, hypothesis, variant_a, variant_b, metric, status, start_date, end_date, winner, results, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'A/B test not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update ab test error:', err);
    res.status(500).json({ error: 'Failed to update A/B test' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ab_tests WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'A/B test not found' });
    res.json({ message: 'A/B test deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete ab test error:', err);
    res.status(500).json({ error: 'Failed to delete A/B test' });
  }
});

module.exports = router;
