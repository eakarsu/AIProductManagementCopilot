const router = require('express').Router();
const pool = require('../db');

// GET all roadmap items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roadmap_items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get roadmap items error:', err);
    res.status(500).json({ error: 'Failed to fetch roadmap items' });
  }
});

// GET roadmap item by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roadmap_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get roadmap item error:', err);
    res.status(500).json({ error: 'Failed to fetch roadmap item' });
  }
});

// POST create roadmap item
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, quarter, category, owner, progress, start_date, end_date } = req.body;
    const result = await pool.query(
      `INSERT INTO roadmap_items (title, description, status, priority, quarter, category, owner, progress, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, description, status, priority, quarter, category, owner, progress || 0, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create roadmap item error:', err);
    res.status(500).json({ error: 'Failed to create roadmap item' });
  }
});

// PUT update roadmap item
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, quarter, category, owner, progress, start_date, end_date } = req.body;
    const result = await pool.query(
      `UPDATE roadmap_items SET title=$1, description=$2, status=$3, priority=$4, quarter=$5, category=$6, owner=$7, progress=$8, start_date=$9, end_date=$10
       WHERE id=$11 RETURNING *`,
      [title, description, status, priority, quarter, category, owner, progress, start_date, end_date, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update roadmap item error:', err);
    res.status(500).json({ error: 'Failed to update roadmap item' });
  }
});

// DELETE roadmap item
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM roadmap_items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap item not found' });
    }
    res.json({ message: 'Roadmap item deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete roadmap item error:', err);
    res.status(500).json({ error: 'Failed to delete roadmap item' });
  }
});

module.exports = router;
