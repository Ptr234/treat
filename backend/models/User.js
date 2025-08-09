import { query } from '../database/connection.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create({ email, password, firstName, lastName, phone, role = 'user', is_verified = false }) {
    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, phone, role, is_verified, created_at`,
      [email, passwordHash, firstName, lastName, phone, role, is_verified]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, role, is_verified, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  }

  static async updateProfile(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (['first_name', 'last_name', 'phone'].includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, phone, role, is_verified, created_at`,
      values
    );
    
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers(limit = 50, offset = 0) {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, role, is_verified, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  static async deleteById(id) {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows[0];
  }

  static async markAsVerified(id) {
    const result = await query(
      `UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone, role, is_verified`,
      [id]
    );
    
    return result.rows[0];
  }
}