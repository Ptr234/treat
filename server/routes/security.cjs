const express = require('express');

const router = express.Router();

// CSP violation reporting endpoint
router.post('/csp-report', express.json({ type: 'application/csp-report' }), async (req, res) => {
  try {
    const report = req.body;
    
    console.warn('🚨 CSP Violation Report:', JSON.stringify(report, null, 2));
    
    res.status(204).end();
  } catch (error) {
    console.error('Error processing CSP report:', error);
    res.status(500).json({ error: 'Failed to process report' });
  }
});

// Security monitoring endpoint (admin only)
router.get('/events', async (req, res) => {
  try {
    // This would typically require admin authentication
    // For now, just return a simple response
    res.json({ 
      message: 'Security monitoring endpoint',
      note: 'This endpoint requires admin authentication in production'
    });
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({ error: 'Failed to get security events' });
  }
});

module.exports = router;