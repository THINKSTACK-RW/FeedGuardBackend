const analyticsService = require('../services/analyticsService');

const dashboardController = {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get trends data for charts
  async getTrendsData(req, res) {
    try {
      const { period = '7d' } = req.query;
      const trends = await analyticsService.getTrendsData(period);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get regional breakdown
  async getRegionalBreakdown(req, res) {
    try {
      const regions = await analyticsService.getRegionalBreakdown();
      res.json(regions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get meal frequency analysis
  async getMealFrequencyAnalysis(req, res) {
    try {
      const mealData = await analyticsService.getMealFrequencyAnalysis();
      res.json(mealData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = dashboardController;
