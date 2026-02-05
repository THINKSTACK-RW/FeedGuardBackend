const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizenController');

// GET /api/citizens - Get all citizens
router.get('/', citizenController.getAllCitizens);

// GET /api/citizens/:id - Get citizen by ID
router.get('/:id', citizenController.getCitizenById);

// POST /api/citizens - Create new citizen
router.post('/', citizenController.createCitizen);

// PUT /api/citizens/:id - Update citizen
router.put('/:id', citizenController.updateCitizen);

// DELETE /api/citizens/:id - Delete citizen
router.delete('/:id', citizenController.deleteCitizen);

module.exports = router;
