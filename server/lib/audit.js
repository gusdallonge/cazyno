import db from '../db.js';

export async function logAction({ actorId, actorEmail, action, targetType, targetId, details, ip }) {
  await db.query(
    `INSERT INTO audit_logs (actor_id, actor_email, action, target_type, target_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [actorId, actorEmail, action, targetType, targetId, JSON.stringify(details || {}), ip]
  );
}
