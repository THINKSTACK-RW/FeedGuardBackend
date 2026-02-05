const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { authenticateToken, adminOrMinistryOnly } = require('../middleware/auth');

// Public routes (read-only)
router.get('/', surveyController.getAllSurveys);
router.get('/:id', surveyController.getSurveyById);

// Protected routes (require authentication)
router.use(authenticateToken);

// POST /api/surveys - Create new survey (admin or ministry only)
router.post('/', adminOrMinistryOnly, surveyController.createSurvey);

// PUT /api/surveys/:id - Update survey (admin or ministry only)
router.put('/:id', adminOrMinistryOnly, surveyController.updateSurvey);

// DELETE /api/surveys/:id - Delete survey (admin or ministry only)
router.delete('/:id', adminOrMinistryOnly, surveyController.deleteSurvey);

module.exports = router;
