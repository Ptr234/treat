import express from 'express';
import Joi from 'joi';
import { query } from '../database/connection.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation schema
const supportTicketSchema = Joi.object({
  subject: Joi.string().min(5).max(255).required(),
  message: Joi.string().min(10).required(),
  category: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

// Create support ticket
router.post('/tickets', authMiddleware, async (req, res, next) => {
  try {
    const { error, value } = supportTicketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const result = await query(`
      INSERT INTO support_tickets (user_id, subject, message, category, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, value.subject, value.message, value.category, value.priority]);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get user's support tickets
router.get('/tickets/my', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT id, subject, message, category, priority, status, created_at, updated_at
      FROM support_tickets
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

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

// Get specific support ticket
router.get('/tickets/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT st.*, u.email, u.first_name, u.last_name
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE st.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const ticket = result.rows[0];

    // Check if user owns this ticket or is admin
    if (ticket.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
});

// Contact form (public endpoint)
router.post('/contact', async (req, res, next) => {
  try {
    const contactSchema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      subject: Joi.string().min(5).max(255).required(),
      message: Joi.string().min(10).required(),
      category: Joi.string().optional()
    });

    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Store contact form submission
    const result = await query(`
      INSERT INTO support_tickets (subject, message, category, priority)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `, [
      `Contact Form: ${value.subject}`,
      `From: ${value.name} (${value.email})\n\n${value.message}`,
      value.category || 'general',
      'medium'
    ]);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: {
        ticketId: result.rows[0].id,
        submittedAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/tickets', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const priority = req.query.priority;

    let queryText = `
      SELECT st.*, u.email, u.first_name, u.last_name
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`st.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (priority) {
      conditions.push(`st.priority = $${paramCount}`);
      values.push(priority);
      paramCount++;
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY st.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

export default router;