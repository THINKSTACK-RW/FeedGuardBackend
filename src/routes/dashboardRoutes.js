const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/trends - Get trends data for charts
router.get('/trends', dashboardController.getTrendsData);

// GET /api/dashboard/regions - Get regional breakdown
router.get('/regions', dashboardController.getRegionalBreakdown);

// GET /api/dashboard/meal-frequency - Get meal frequency analysis
router.get('/meal-frequency', dashboardController.getMealFrequencyAnalysis);

module.exports = router;
