const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM releases ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get releases error:', err);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM releases WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get release error:', err);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { version, name, description, status, release_date, features_count, bug_fixes_count, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO releases (version, name, description, status, release_date, features_count, bug_fixes_count, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [version, name, description, status, release_date, features_count, bug_fixes_count, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create release error:', err);
    res.status(500).json({ error: 'Failed to create release' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { version, name, description, status, release_date, features_count, bug_fixes_count, notes } = req.body;
    const result = await pool.query(
      `UPDATE releases SET version=$1, name=$2, description=$3, status=$4, release_date=$5, features_count=$6, bug_fixes_count=$7, notes=$8
       WHERE id=$9 RETURNING *`,
      [version, name, description, status, release_date, features_count, bug_fixes_count, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update release error:', err);
    res.status(500).json({ error: 'Failed to update release' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM releases WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json({ message: 'Release deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete release error:', err);
    res.status(500).json({ error: 'Failed to delete release' });
  }
});

module.exports = router;
