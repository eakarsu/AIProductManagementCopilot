const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM team_capacity');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM team_capacity ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get capacity error:', err);
    res.status(500).json({ error: 'Failed to fetch team capacity' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_capacity WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Capacity entry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get capacity error:', err);
    res.status(500).json({ error: 'Failed to fetch capacity entry' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_name, role, availability_percent, sprint_id, allocated_hours, skills, current_load, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO team_capacity (member_name, role, availability_percent, sprint_id, allocated_hours, skills, current_load, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [member_name, role, availability_percent, sprint_id, allocated_hours, skills, current_load, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create capacity error:', err);
    res.status(500).json({ error: 'Failed to create capacity entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { member_name, role, availability_percent, sprint_id, allocated_hours, skills, current_load, notes } = req.body;
    const result = await pool.query(
      `UPDATE team_capacity SET member_name=$1, role=$2, availability_percent=$3, sprint_id=$4, allocated_hours=$5, skills=$6, current_load=$7, notes=$8
       WHERE id=$9 RETURNING *`,
      [member_name, role, availability_percent, sprint_id, allocated_hours, skills, current_load, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Capacity entry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update capacity error:', err);
    res.status(500).json({ error: 'Failed to update capacity entry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM team_capacity WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Capacity entry not found' });
    res.json({ message: 'Capacity entry deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete capacity error:', err);
    res.status(500).json({ error: 'Failed to delete capacity entry' });
  }
});

module.exports = router;
