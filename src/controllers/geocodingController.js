const geocodingService = require('../services/geocodingService');

const geocodingController = {
  // Geocode a location
  async geocodeLocation(req, res) {
    try {
      const { district, sector, village, cell } = req.query;
      
      if (!district) {
        return res.status(400).json({ error: 'District is required' });
      }

      const coords = await geocodingService.geocodeLocation(district, sector, village, cell);
      
      res.json({
        success: true,
        coordinates: coords,
        location: {
          district,
          sector,
          village,
          cell,
          province: geocodingService.getProvince(district),
          country: 'Rwanda'
        }
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ 
        error: 'Geocoding failed', 
        details: error.message 
      });
    }
  },

  // Get available districts
  async getDistricts(req, res) {
    try {
      const districts = geocodingService.getAvailableDistricts();
      res.json({
        success: true,
        districts
      });
    } catch (error) {
      console.error('Get districts error:', error);
      res.status(500).json({ 
        error: 'Failed to get districts', 
        details: error.message 
      });
    }
  },

  // Get sectors for a district
  async getSectors(req, res) {
    try {
      const { district } = req.params;
      
      if (!district) {
        return res.status(400).json({ error: 'District is required' });
      }

      const sectors = geocodingService.getSectorsForDistrict(district);
      
      res.json({
        success: true,
        district,
        sectors
      });
    } catch (error) {
      console.error('Get sectors error:', error);
      res.status(500).json({ 
        error: 'Failed to get sectors', 
        details: error.message 
      });
    }
  },

  // Get cells for a sector
  async getCells(req, res) {
    try {
      const { district, sector } = req.params;
      
      if (!district || !sector) {
        return res.status(400).json({ error: 'District and sector are required' });
      }

      const cells = geocodingService.getCellsForSector(district, sector);
      
      res.json({
        success: true,
        district,
        sector,
        cells
      });
    } catch (error) {
      console.error('Get cells error:', error);
      res.status(500).json({ 
        error: 'Failed to get cells', 
        details: error.message 
      });
    }
  }
};

module.exports = geocodingController;
