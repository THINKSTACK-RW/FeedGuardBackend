const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');

// GET /api/answers - Get all answers
router.get('/', answerController.getAllAnswers);

// GET /api/answers/:id - Get answer by ID
router.get('/:id', answerController.getAnswerById);

// POST /api/answers - Create new answer
router.post('/', answerController.createAnswer);

// PUT /api/answers/:id - Update answer
router.put('/:id', answerController.updateAnswer);

// DELETE /api/answers/:id - Delete answer
router.delete('/:id', answerController.deleteAnswer);

module.exports = router;
