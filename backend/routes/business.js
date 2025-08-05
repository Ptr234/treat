import express from 'express';
import Joi from 'joi';
import { BusinessRegistration } from '../models/BusinessRegistration.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation schema
const businessRegistrationSchema = Joi.object({
  businessName: Joi.string().min(2).max(255).required(),
  businessType: Joi.string().required(),
  address: Joi.string().required(),
  district: Joi.string().required(),
  sector: Joi.string().required()
});

// Create business registration
router.post('/register', authMiddleware, async (req, res, next) => {
  try {
    const { error, value } = businessRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const businessData = {
      ...value,
      userId: req.user.id
    };

    const registration = await BusinessRegistration.create(businessData);

    res.status(201).json({
      success: true,
      message: 'Business registration submitted successfully',
      data: registration
    });
  } catch (error) {
    next(error);
  }
});

// Get user's business registrations
router.get('/my-registrations', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const registrations = await BusinessRegistration.findByUserId(req.user.id, limit, offset);

    res.json({
      success: true,
      data: registrations,
      pagination: {
        page,
        limit,
        hasMore: registrations.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific business registration
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const registration = await BusinessRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Business registration not found'
      });
    }

    // Check if user owns this registration or is admin
    if (registration.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/', authMiddleware, async (req, res, next) => {
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

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.businessType) filters.businessType = req.query.businessType;
    if (req.query.district) filters.district = req.query.district;

    const registrations = await BusinessRegistration.getAll(filters, limit, offset);

    res.json({
      success: true,
      data: registrations,
      pagination: {
        page,
        limit,
        hasMore: registrations.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update registration status (admin only)
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const registration = await BusinessRegistration.updateStatus(req.params.id, status, req.user.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Business registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration status updated successfully',
      data: registration
    });
  } catch (error) {
    next(error);
  }
});

// Get business registration statistics (admin only)
router.get('/admin/stats', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await BusinessRegistration.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

export default router;