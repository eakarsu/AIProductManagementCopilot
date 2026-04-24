const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_metrics ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_metrics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Metric not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get metric error:', err);
    res.status(500).json({ error: 'Failed to fetch metric' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, current_value, target_value, unit, category, trend, last_updated } = req.body;
    const result = await pool.query(
      `INSERT INTO product_metrics (name, description, current_value, target_value, unit, category, trend, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, current_value, target_value, unit, category, trend, last_updated || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create metric error:', err);
    res.status(500).json({ error: 'Failed to create metric' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, current_value, target_value, unit, category, trend, last_updated } = req.body;
    const result = await pool.query(
      `UPDATE product_metrics SET name=$1, description=$2, current_value=$3, target_value=$4, unit=$5, category=$6, trend=$7, last_updated=$8
       WHERE id=$9 RETURNING *`,
      [name, description, current_value, target_value, unit, category, trend, last_updated || new Date(), req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Metric not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update metric error:', err);
    res.status(500).json({ error: 'Failed to update metric' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM product_metrics WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Metric not found' });
    res.json({ message: 'Metric deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete metric error:', err);
    res.status(500).json({ error: 'Failed to delete metric' });
  }
});

module.exports = router;
