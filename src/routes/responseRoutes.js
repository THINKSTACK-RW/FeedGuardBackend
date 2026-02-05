const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');

// GET /api/responses - Get all responses
router.get('/', responseController.getAllResponses);

// GET /api/responses/:id - Get response by ID
router.get('/:id', responseController.getResponseById);

// POST /api/responses - Create new response
router.post('/', responseController.createResponse);

// PUT /api/responses/:id - Update response
router.put('/:id', responseController.updateResponse);

// DELETE /api/responses/:id - Delete response
router.delete('/:id', responseController.deleteResponse);

module.exports = router;
