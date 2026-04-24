const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stakeholders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get stakeholders error:', err);
    res.status(500).json({ error: 'Failed to fetch stakeholders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stakeholders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stakeholder not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get stakeholder error:', err);
    res.status(500).json({ error: 'Failed to fetch stakeholder' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, role, department, influence, interest, email, communication_preference, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO stakeholders (name, role, department, influence, interest, email, communication_preference, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, role, department, influence, interest, email, communication_preference, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create stakeholder error:', err);
    res.status(500).json({ error: 'Failed to create stakeholder' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, role, department, influence, interest, email, communication_preference, notes } = req.body;
    const result = await pool.query(
      `UPDATE stakeholders SET name=$1, role=$2, department=$3, influence=$4, interest=$5, email=$6, communication_preference=$7, notes=$8
       WHERE id=$9 RETURNING *`,
      [name, role, department, influence, interest, email, communication_preference, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stakeholder not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update stakeholder error:', err);
    res.status(500).json({ error: 'Failed to update stakeholder' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM stakeholders WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stakeholder not found' });
    res.json({ message: 'Stakeholder deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete stakeholder error:', err);
    res.status(500).json({ error: 'Failed to delete stakeholder' });
  }
});

module.exports = router;
