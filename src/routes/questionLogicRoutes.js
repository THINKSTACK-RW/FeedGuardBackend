const express = require('express');
const router = express.Router();
const questionLogicController = require('../controllers/questionLogicController');

// GET /api/question-logic - Get all question logic
router.get('/', questionLogicController.getAllQuestionLogic);

// GET /api/question-logic/:id - Get question logic by ID
router.get('/:id', questionLogicController.getQuestionLogicById);

// POST /api/question-logic - Create new question logic
router.post('/', questionLogicController.createQuestionLogic);

// PUT /api/question-logic/:id - Update question logic
router.put('/:id', questionLogicController.updateQuestionLogic);

// DELETE /api/question-logic/:id - Delete question logic
router.delete('/:id', questionLogicController.deleteQuestionLogic);

module.exports = router;
