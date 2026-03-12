const express = require('express');
const router = express.Router();
const geocodingController = require('../controllers/geocodingController');

// Geocode a location
// GET /api/geocoding?district=Gasabo&sector=Remera&village=Kinyinya&cell=Gikomero
router.get('/', geocodingController.geocodeLocation);

// Get all available districts
// GET /api/geocoding/districts
router.get('/districts', geocodingController.getDistricts);

// Get sectors for a specific district
// GET /api/geocoding/districts/:district/sectors
router.get('/districts/:district/sectors', geocodingController.getSectors);

// Get cells for a specific sector
// GET /api/geocoding/districts/:district/sectors/:sector/cells
router.get('/districts/:district/sectors/:sector/cells', geocodingController.getCells);

module.exports = router;
