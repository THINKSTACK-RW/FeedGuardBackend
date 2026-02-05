const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// GET /api/locations - Get all locations
router.get('/', locationController.getAllLocations);

// GET /api/locations/:id - Get location by ID
router.get('/:id', locationController.getLocationById);

// POST /api/locations - Create new location
router.post('/', locationController.createLocation);

// PUT /api/locations/:id - Update location
router.put('/:id', locationController.updateLocation);

// DELETE /api/locations/:id - Delete location
router.delete('/:id', locationController.deleteLocation);

module.exports = router;
