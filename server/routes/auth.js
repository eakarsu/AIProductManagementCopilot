'use strict';
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { auth, secret } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password, organizationId, productId, tenant, tenantSlug } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const organizationRef = organizationId || tenant || tenantSlug || null;
    const params = [email];
    const predicates = [];
    if (organizationRef) {
      params.push(String(organizationRef));
      predicates.push(`(m.organization_id::text=$${params.length} OR LOWER(o.name)=LOWER($${params.length}))`);
    }
    if (productId) {
      params.push(String(productId));
      predicates.push(`(m.product_id::text=$${params.length} OR LOWER(p.name)=LOWER($${params.length}))`);
    }
    const result = await pool.query(
      `SELECT u.id,u.email,u.password_hash,u.name,m.organization_id,m.product_id,m.role
       FROM users u
       JOIN pm_memberships m ON m.user_id=u.id AND m.active=TRUE
       JOIN pm_organizations o ON o.id=m.organization_id
       JOIN pm_products p ON p.id=m.product_id
       WHERE LOWER(u.email)=LOWER($1)${predicates.length ? ` AND ${predicates.join(' AND ')}` : ''}
       ORDER BY m.organization_id,m.product_id LIMIT 2`,
      params
    );
    if (result.rows.length !== 1) return res.status(401).json({ error: 'Invalid or ambiguous credentials' });
    const row = result.rows[0];
    if (!await bcrypt.compare(password, row.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    const user = { id: row.id, email: row.email, name: row.name, organizationId: row.organization_id, productId: row.product_id, role: row.role };
    const token = jwt.sign(user, secret(), { issuer: 'product-management-copilot', expiresIn: process.env.JWT_TTL || '1h' });
    res.json({ token, user });
  } catch (_error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', auth, (req, res) => res.json({ user: req.user }));
module.exports = router;
