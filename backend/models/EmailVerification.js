import { query } from '../database/connection.js';

export class EmailVerification {
  static async create({ email, code, type = 'registration', userId = null }) {
    await this.cleanup(email, type);
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    const result = await query(
      `INSERT INTO email_verifications (email, verification_code, type, user_id, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, type, created_at, expires_at`,
      [email, code, type, userId, expiresAt]
    );
    
    return result.rows[0];
  }

  static async findByEmailAndCode(email, code, type = 'registration') {
    const result = await query(
      `SELECT * FROM email_verifications 
       WHERE email = $1 AND verification_code = $2 AND type = $3 
       AND expires_at > NOW() AND verified_at IS NULL`,
      [email, code, type]
    );
    
    return result.rows[0];
  }

  static async markAsVerified(id) {
    const result = await query(
      `UPDATE email_verifications 
       SET verified_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    return result.rows[0];
  }

  static async cleanup(email, type) {
    await query(
      `DELETE FROM email_verifications 
       WHERE email = $1 AND type = $2`,
      [email, type]
    );
  }

  static async cleanupExpired() {
    const result = await query(
      `DELETE FROM email_verifications 
       WHERE expires_at < NOW()
       RETURNING count(*)`
    );
    
    return result.rowCount;
  }

  static async findPendingByEmail(email, type = 'registration') {
    const result = await query(
      `SELECT * FROM email_verifications 
       WHERE email = $1 AND type = $2 
       AND expires_at > NOW() AND verified_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, type]
    );
    
    return result.rows[0];
  }

  static async getRemainingTime(email, type = 'registration') {
    const result = await query(
      `SELECT EXTRACT(EPOCH FROM (expires_at - NOW())) as remaining_seconds
       FROM email_verifications 
       WHERE email = $1 AND type = $2 
       AND expires_at > NOW() AND verified_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, type]
    );
    
    return result.rows[0]?.remaining_seconds || 0;
  }
}