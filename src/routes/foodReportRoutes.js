const express = require('express');
const router = express.Router();
const foodReportController = require('../controllers/foodReportController');

// POST /api/food-reports/predict - Predict risk from incoming data
router.post('/predict', foodReportController.predictFoodRisk);

// POST /api/food-reports - Submit a new food report from mobile app
router.post('/', foodReportController.submitFoodReport);

// GET /api/food-reports/history - Get citizen's report history
router.get('/history', foodReportController.getReportHistory);

// GET /api/food-reports/stats - Get food security statistics
router.get('/stats', foodReportController.getFoodSecurityStats);

module.exports = router;
