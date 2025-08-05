import express from 'express';
import { query } from '../database/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all investments (public)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sector = req.query.sector;
    const riskLevel = req.query.riskLevel;

    let queryText = `
      SELECT id, title, description, sector, location, investment_amount, 
             roi_percentage, risk_level, status, created_at
      FROM investments 
      WHERE status = 'active'
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (sector) {
      conditions.push(`sector = $${paramCount}`);
      values.push(sector);
      paramCount++;
    }

    if (riskLevel) {
      conditions.push(`risk_level = $${paramCount}`);
      values.push(riskLevel);
      paramCount++;
    }

    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Get investment sectors (public)
router.get('/sectors', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT sector, COUNT(*) as count
      FROM investments 
      WHERE status = 'active'
      GROUP BY sector
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get specific investment (public)
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, title, description, sector, location, investment_amount, 
             roi_percentage, risk_level, status, created_at
      FROM investments 
      WHERE id = $1 AND status = 'active'
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Investment opportunity not found'
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

// Create investment (admin only)
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const {
      title,
      description,
      sector,
      location,
      investmentAmount,
      roiPercentage,
      riskLevel
    } = req.body;

    const result = await query(`
      INSERT INTO investments 
      (title, description, sector, location, investment_amount, roi_percentage, risk_level, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [title, description, sector, location, investmentAmount, roiPercentage, riskLevel, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Investment opportunity created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router;