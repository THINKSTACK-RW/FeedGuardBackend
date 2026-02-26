const alertService = require('../services/alertService');

const alertsController = {
  // Get all alerts
  async getAlerts(req, res) {
    try {
      const { status, severity } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (severity) filters.severity = severity;
      
      const alerts = await alertService.getAlerts(filters);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Dismiss an alert
  async dismissAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertService.dismissAlert(id);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Take action on alert
  async takeActionOnAlert(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const alert = await alertService.takeActionOnAlert(id, action);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get alert statistics
  async getAlertStats(req, res) {
    try {
      const stats = await alertService.getAlertStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Generate alerts (for scheduled jobs)
  async generateAlerts(req, res) {
    try {
      const alerts = await alertService.generateAlerts();
      res.json({ message: 'Alerts generated successfully', count: alerts.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = alertsController;
