const router = require('express').Router();
const pool = require('../db');

// GET all features
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM features ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get features error:', err);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

// GET feature by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM features WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get feature error:', err);
    res.status(500).json({ error: 'Failed to fetch feature' });
  }
});

// POST create feature
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, effort, impact, score, category, assignee } = req.body;
    const result = await pool.query(
      `INSERT INTO features (title, description, status, priority, effort, impact, score, category, assignee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, status, priority, effort, impact, score, category, assignee]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create feature error:', err);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

// PUT update feature
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, effort, impact, score, category, assignee } = req.body;
    const result = await pool.query(
      `UPDATE features SET title=$1, description=$2, status=$3, priority=$4, effort=$5, impact=$6, score=$7, category=$8, assignee=$9
       WHERE id=$10 RETURNING *`,
      [title, description, status, priority, effort, impact, score, category, assignee, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update feature error:', err);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

// DELETE feature
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM features WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    res.json({ message: 'Feature deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete feature error:', err);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
});

module.exports = router;
