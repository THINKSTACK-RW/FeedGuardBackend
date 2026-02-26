const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// GET /api/reports/summary - Get report summary
router.get('/summary', reportsController.getReportSummary);

// GET /api/reports/detailed - Get detailed reports
router.get('/detailed', reportsController.getDetailedReports);

// GET /api/reports/export - Export reports
router.get('/export', reportsController.exportReports);

// GET /api/reports/insights - Get insights and predictions
router.get('/insights', reportsController.getInsights);

module.exports = router;
