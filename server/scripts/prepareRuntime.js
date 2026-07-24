'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../db');

async function main() {
  if (process.env.ALLOW_SCHEMA_MIGRATION !== 'true') throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  const migrationDir = path.join(__dirname, '..', 'migrations');
  for (const file of fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort()) {
    await pool.query(fs.readFileSync(path.join(migrationDir, file), 'utf8'));
  }

  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator';
  if (!email || !password) throw new Error('Provisioned administrator credentials are required');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = (await pool.query(
    `INSERT INTO users(email,password_hash,name,role) VALUES($1,$2,$3,'admin')
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name,role='admin'
     RETURNING id`,
    [email, passwordHash, name]
  )).rows[0];

  const organizationName = process.env.GOVERNANCE_TENANT_ID || 'runtime-tenant';
  let organization = (await pool.query('SELECT id FROM pm_organizations WHERE name=$1 ORDER BY id LIMIT 1', [organizationName])).rows[0];
  if (!organization) organization = (await pool.query('INSERT INTO pm_organizations(name) VALUES($1) RETURNING id', [organizationName])).rows[0];
  const product = (await pool.query(
    `INSERT INTO pm_products(organization_id,name) VALUES($1,$2)
     ON CONFLICT(organization_id,name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [organization.id, 'Runtime Product']
  )).rows[0];
  await pool.query(
    `INSERT INTO pm_memberships(organization_id,product_id,user_id,role,active,can_view_confidential,can_publish_confidential)
     VALUES($1,$2,$3,'admin',TRUE,TRUE,TRUE)
     ON CONFLICT(organization_id,product_id,user_id)
     DO UPDATE SET role='admin',active=TRUE,can_view_confidential=TRUE,can_publish_confidential=TRUE`,
    [organization.id, product.id, user.id]
  );
}

main().then(() => pool.end()).catch(async (error) => {
  console.error(error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
