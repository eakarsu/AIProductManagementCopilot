const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM okrs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get OKRs error:', err);
    res.status(500).json({ error: 'Failed to fetch OKRs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM okrs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'OKR not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get OKR error:', err);
    res.status(500).json({ error: 'Failed to fetch OKR' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { objective, key_result, progress, owner, quarter, status, category, target_value, current_value } = req.body;
    const result = await pool.query(
      `INSERT INTO okrs (objective, key_result, progress, owner, quarter, status, category, target_value, current_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [objective, key_result, progress || 0, owner, quarter, status, category, target_value, current_value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create OKR error:', err);
    res.status(500).json({ error: 'Failed to create OKR' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { objective, key_result, progress, owner, quarter, status, category, target_value, current_value } = req.body;
    const result = await pool.query(
      `UPDATE okrs SET objective=$1, key_result=$2, progress=$3, owner=$4, quarter=$5, status=$6, category=$7, target_value=$8, current_value=$9
       WHERE id=$10 RETURNING *`,
      [objective, key_result, progress, owner, quarter, status, category, target_value, current_value, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'OKR not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update OKR error:', err);
    res.status(500).json({ error: 'Failed to update OKR' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM okrs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'OKR not found' });
    res.json({ message: 'OKR deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete OKR error:', err);
    res.status(500).json({ error: 'Failed to delete OKR' });
  }
});

module.exports = router;
