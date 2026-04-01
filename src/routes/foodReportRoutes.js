const express = require('express');
const foodReportController = require('../controllers/foodReportController');

const router = express.Router();

// POST /api/v2/food-reports - Submit a new food report with AI risk assessment
router.post('/', foodReportController.submitFoodReport);

// GET /api/v2/food-reports/history - Get report history for a citizen
router.get('/history', foodReportController.getReportHistory);

// GET /api/v2/food-reports/stats - Get dashboard statistics
router.get('/stats', foodReportController.getFoodReportStats);

// GET /api/v2/food-reports/trends - Get trends analysis
router.get('/trends', foodReportController.getFoodReportTrends);

// GET /api/v2/food-reports/regional - Get regional breakdown
router.get('/regional', foodReportController.getRegionalFoodReports);

// GET /api/v2/food-reports - Get all reports (with limit)
router.get('/', foodReportController.getAllFoodReports);

module.exports = router;
