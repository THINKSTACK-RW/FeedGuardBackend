const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// GET /api/reports/summary - Get report summary
router.get('/summary', reportsController.getReportSummary);

// GET /api/reports/regional - Get reports grouped by location
router.get('/regional', reportsController.getRegionalReports);

// GET /api/reports/location/:locationId - Get individual responses for a location
router.get('/location/:locationId', reportsController.getLocationResponses);

// GET /api/reports/location/:locationId/export - Export location responses
router.get('/location/:locationId/export', reportsController.exportLocationResponses);

// GET /api/reports/map - Get map data with grouped responses
router.get('/map', reportsController.getMapData);

// GET /api/reports/detailed - Get detailed reports (legacy)
router.get('/detailed', reportsController.getDetailedReports);

// GET /api/reports/export - Export reports (legacy)
router.get('/export', reportsController.exportReports);

// GET /api/reports/insights - Get insights and predictions
router.get('/insights', reportsController.getInsights);

module.exports = router;
