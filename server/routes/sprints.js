const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sprints ORDER BY created_at DESC');
    res.json(result.rows);
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

module.exports = router;
