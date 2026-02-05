const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// GET /api/questions - Get all questions
router.get('/', questionController.getAllQuestions);

// GET /api/questions/:id - Get question by ID
router.get('/:id', questionController.getQuestionById);

// POST /api/questions - Create new question
router.post('/', questionController.createQuestion);

// PUT /api/questions/:id - Update question
router.put('/:id', questionController.updateQuestion);

// DELETE /api/questions/:id - Delete question
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
