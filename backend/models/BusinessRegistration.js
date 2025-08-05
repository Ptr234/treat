import { query } from '../database/connection.js';

export class BusinessRegistration {
  static async create(data) {
    const result = await query(
      `INSERT INTO business_registrations 
       (user_id, business_name, business_type, address, district, sector)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.userId, data.businessName, data.businessType, data.address, data.district, data.sector]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT br.*, u.email, u.first_name, u.last_name
       FROM business_registrations br
       JOIN users u ON br.user_id = u.id
       WHERE br.id = $1`,
      [id]
    );
    
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 10, offset = 0) {
    const result = await query(
      `SELECT * FROM business_registrations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    return result.rows;
  }

  static async updateStatus(id, status, processedBy = null) {
    const result = await query(
      `UPDATE business_registrations
       SET status = $1, processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    return result.rows[0];
  }

  static async getAll(filters = {}, limit = 50, offset = 0) {
    let queryText = `
      SELECT br.*, u.email, u.first_name, u.last_name
      FROM business_registrations br
      JOIN users u ON br.user_id = u.id
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      conditions.push(`br.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.businessType) {
      conditions.push(`br.business_type = $${paramCount}`);
      values.push(filters.businessType);
      paramCount++;
    }

    if (filters.district) {
      conditions.push(`br.district = $${paramCount}`);
      values.push(filters.district);
      paramCount++;
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY br.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(queryText, values);
    return result.rows;
  }

  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'under_review') as under_review
      FROM business_registrations
    `);
    
    return result.rows[0];
  }
}