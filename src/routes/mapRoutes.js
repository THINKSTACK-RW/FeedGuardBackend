const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// GET /api/map/regions - Get map data with regions
router.get('/regions', mapController.getMapRegions);

// GET /api/map/regions/:id/details - Get detailed region information
router.get('/regions/:id/details', mapController.getRegionDetails);

module.exports = router;
