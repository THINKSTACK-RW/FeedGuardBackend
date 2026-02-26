const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

// GET /api/alerts - Get all alerts
router.get('/', alertsController.getAlerts);

// POST /api/alerts/:id/dismiss - Dismiss an alert
router.post('/:id/dismiss', alertsController.dismissAlert);

// POST /api/alerts/:id/action - Take action on alert
router.post('/:id/action', alertsController.takeActionOnAlert);

// GET /api/alerts/stats - Get alert statistics
router.get('/stats', alertsController.getAlertStats);

// POST /api/alerts/generate - Generate alerts (for scheduled jobs)
router.post('/generate', alertsController.generateAlerts);

module.exports = router;
