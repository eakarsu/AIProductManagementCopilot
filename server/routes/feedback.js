const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer_feedback ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer_feedback WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { source, customer_name, feedback_text, sentiment, category, priority, status, feature_request } = req.body;
    const result = await pool.query(
      `INSERT INTO customer_feedback (source, customer_name, feedback_text, sentiment, category, priority, status, feature_request)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [source, customer_name, feedback_text, sentiment, category, priority, status, feature_request]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create feedback error:', err);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { source, customer_name, feedback_text, sentiment, category, priority, status, feature_request } = req.body;
    const result = await pool.query(
      `UPDATE customer_feedback SET source=$1, customer_name=$2, feedback_text=$3, sentiment=$4, category=$5, priority=$6, status=$7, feature_request=$8
       WHERE id=$9 RETURNING *`,
      [source, customer_name, feedback_text, sentiment, category, priority, status, feature_request, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update feedback error:', err);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customer_feedback WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Feedback deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete feedback error:', err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

module.exports = router;
