const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM requirements');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM requirements ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get requirements error:', err);
    res.status(500).json({ error: 'Failed to fetch requirements' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requirements WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Requirement not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get requirement error:', err);
    res.status(500).json({ error: 'Failed to fetch requirement' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, type, priority, status, acceptance_criteria, stakeholder, source } = req.body;
    const result = await pool.query(
      `INSERT INTO requirements (title, description, type, priority, status, acceptance_criteria, stakeholder, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, type, priority, status, acceptance_criteria, stakeholder, source]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create requirement error:', err);
    res.status(500).json({ error: 'Failed to create requirement' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, type, priority, status, acceptance_criteria, stakeholder, source } = req.body;
    const result = await pool.query(
      `UPDATE requirements SET title=$1, description=$2, type=$3, priority=$4, status=$5, acceptance_criteria=$6, stakeholder=$7, source=$8
       WHERE id=$9 RETURNING *`,
      [title, description, type, priority, status, acceptance_criteria, stakeholder, source, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Requirement not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update requirement error:', err);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM requirements WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Requirement not found' });
    res.json({ message: 'Requirement deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete requirement error:', err);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
});

module.exports = router;
