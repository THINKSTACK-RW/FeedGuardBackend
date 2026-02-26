const reportService = require('../services/reportService');

const mapController = {
  // Get map data with regions
  async getMapRegions(req, res) {
    try {
      const mapData = await reportService.getMapData();
      res.json(mapData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get detailed region information
  async getRegionDetails(req, res) {
    try {
      const { id } = req.params;
      const mapData = await reportService.getMapData();
      const region = mapData.find(r => r.id == id);
      
      if (!region) {
        return res.status(404).json({ error: 'Region not found' });
      }
      
      res.json(region);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = mapController;
