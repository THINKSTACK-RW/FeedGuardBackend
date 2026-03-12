const reportService = require('../services/reportService');

const reportsController = {
  // Get report summary
  async getReportSummary(req, res) {
    try {
      const { region_id, date_range } = req.query;
      const filters = {};
      
      if (region_id) filters.region_id = region_id;
      if (date_range) filters.date_range = date_range;
      
      const summary = await reportService.getReportSummary(filters);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get detailed reports grouped by location
  async getRegionalReports(req, res) {
    try {
      const { region_id, status, date_range } = req.query;
      const filters = {};
      
      if (region_id) filters.region_id = region_id;
      if (status) filters.status = status;
      if (date_range) filters.date_range = date_range;
      
      const reports = await reportService.getRegionalReports(filters);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get individual responses for a specific location
  async getLocationResponses(req, res) {
    try {
      const { locationId } = req.params;
      const { status, date_range } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (date_range) filters.date_range = date_range;
      
      const locationData = await reportService.getLocationResponses(locationId, filters);
      res.json(locationData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export location responses
  async exportLocationResponses(req, res) {
    try {
      const { locationId } = req.params;
      const { format = 'csv', status, date_range } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (date_range) filters.date_range = date_range;
      
      const exportData = await reportService.exportLocationResponses(locationId, format, filters);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="location_responses_${locationId}.csv"`);
        res.send(exportData);
      } else {
        res.json(exportData);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get detailed reports
  async getDetailedReports(req, res) {
    try {
      const { region_id, status, date_range } = req.query;
      const filters = {};
      
      if (region_id) filters.region_id = region_id;
      if (status) filters.status = status;
      if (date_range) filters.date_range = date_range;
      
      const reports = await reportService.getDetailedReports(filters);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export reports
  async exportReports(req, res) {
    try {
      const { format = 'csv', region_id, date_range } = req.query;
      const filters = {};
      
      if (region_id) filters.region_id = region_id;
      if (date_range) filters.date_range = date_range;
      
      const exportData = await reportService.exportReports(format, filters);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reports.csv"');
        res.send(exportData);
      } else {
        res.json(exportData);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get insights
  async getInsights(req, res) {
    try {
      const insights = await reportService.getInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get map data with grouped responses
  async getMapData(req, res) {
    try {
      const mapData = await reportService.getMapData();
      res.json(mapData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reportsController;
