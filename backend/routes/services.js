import express from 'express';
import { query } from '../database/connection.js';

const router = express.Router();

// Get all government services (public)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const department = req.query.department;

    let queryText = `
      SELECT id, name, description, category, department, requirements, 
             processing_time, fee, online_available, created_at
      FROM government_services
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (category) {
      conditions.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    if (department) {
      conditions.push(`department = $${paramCount}`);
      values.push(department);
      paramCount++;
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(queryText, values);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        hasMore: result.rows.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get service categories (public)
router.get('/categories', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT category, COUNT(*) as count
      FROM government_services
      GROUP BY category
      ORDER BY category ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get service departments (public)
router.get('/departments', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT department, COUNT(*) as count
      FROM government_services
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY department ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Search services (public)
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = `%${q.trim()}%`;
    
    const result = await query(`
      SELECT id, name, description, category, department, requirements, 
             processing_time, fee, online_available
      FROM government_services
      WHERE name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1
      ORDER BY 
        CASE 
          WHEN name ILIKE $1 THEN 1
          WHEN category ILIKE $1 THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 50
    `, [searchTerm]);

    res.json({
      success: true,
      data: result.rows,
      query: q.trim()
    });
  } catch (error) {
    next(error);
  }
});

// Get specific service (public)
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, name, description, category, department, requirements, 
             processing_time, fee, online_available, created_at, updated_at
      FROM government_services 
      WHERE id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router;