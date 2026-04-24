const router = require('express').Router();
const pool = require('../db');

// GET all user stories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM user_stories ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get stories error:', err);
    res.status(500).json({ error: 'Failed to fetch user stories' });
  }
});

// GET user story by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM user_stories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User story not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get story error:', err);
    res.status(500).json({ error: 'Failed to fetch user story' });
  }
});

// POST create user story
router.post('/', async (req, res) => {
  try {
    const { title, description, acceptance_criteria, story_points, priority, status, sprint_id, feature_id } = req.body;
    const result = await pool.query(
      `INSERT INTO user_stories (title, description, acceptance_criteria, story_points, priority, status, sprint_id, feature_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, acceptance_criteria, story_points, priority, status, sprint_id, feature_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create story error:', err);
    res.status(500).json({ error: 'Failed to create user story' });
  }
});

// PUT update user story
router.put('/:id', async (req, res) => {
  try {
    const { title, description, acceptance_criteria, story_points, priority, status, sprint_id, feature_id } = req.body;
    const result = await pool.query(
      `UPDATE user_stories SET title=$1, description=$2, acceptance_criteria=$3, story_points=$4, priority=$5, status=$6, sprint_id=$7, feature_id=$8
       WHERE id=$9 RETURNING *`,
      [title, description, acceptance_criteria, story_points, priority, status, sprint_id, feature_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User story not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update story error:', err);
    res.status(500).json({ error: 'Failed to update user story' });
  }
});

// DELETE user story
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM user_stories WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User story not found' });
    }
    res.json({ message: 'User story deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete story error:', err);
    res.status(500).json({ error: 'Failed to delete user story' });
  }
});

module.exports = router;
