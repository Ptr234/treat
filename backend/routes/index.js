import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import businessRoutes from './business.js';
import investmentRoutes from './investments.js';
import serviceRoutes from './services.js';
import supportRoutes from './support.js';

const router = express.Router();

// API version and info
router.get('/', (req, res) => {
  res.json({
    message: 'OneStopCentre Uganda API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      business: '/api/business',
      investments: '/api/investments',
      services: '/api/services',
      support: '/api/support'
    },
    documentation: 'Contact support@onestopcentre.ug for API documentation'
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/business', businessRoutes);
router.use('/investments', investmentRoutes);
router.use('/services', serviceRoutes);
router.use('/support', supportRoutes);

export default router;