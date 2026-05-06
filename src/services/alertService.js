const { Alert, Response, Citizen, Location } = require('../models');

const alertService = {
  // Generate alerts based on response data
  async generateAlerts() {
    try {
      const alerts = [];
      
      // Find regions with critical food insecurity
      const criticalRegions = await Location.findAll({
        attributes: ['id', 'name'],
        include: [{
          model: Citizen,
          include: [{
            model: Response,
            attributes: [
              'id', 'survey_id', 'citizen_id', 'channel', 'submitted_at',
              'food_security_score', 'risk_level', 'meals_per_day', 
              'days_of_food_left', 'food_change_type', 'shocks_experienced'
            ],
            where: { risk_level: 'critical' },
            required: false
          }]
        }]
      });

      for (const region of criticalRegions) {
        const criticalResponses = region.Citizens.flatMap(citizen => citizen.Responses || []);
        const criticalCount = criticalResponses.length;
        
        if (criticalCount > 0) {
          // Check if alert already exists for this region
          const existingAlert = await Alert.findOne({
            where: {
              region_id: region.id,
              severity: 'critical',
              status: ['new', 'investigating']
            }
          });

          if (!existingAlert) {
            await Alert.create({
              region_id: region.id,
              message: `Severe food shortage reported by ${criticalCount} households.`,
              severity: 'critical',
              status: 'new',
              affected_households: criticalCount
            });
          }
        }
      }

      return alerts;
    } catch (error) {
      throw new Error(`Failed to generate alerts: ${error.message}`);
    }
  },

  // Get all alerts with filtering
  async getAlerts(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.severity) {
        whereClause.severity = filters.severity;
      }

      const alerts = await Alert.findAll({
        where: whereClause,
        include: [{
          model: Location,
          attributes: ['name']
        }],
        order: [['created_at', 'DESC']]
      });

      return alerts.map(alert => ({
        id: alert.id,
        region: alert.Location ? alert.Location.name : 'Unknown',
        type: alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1),
        message: alert.message,
        time: this.formatTimeAgo(alert.created_at),
        affected: alert.affected_households,
        status: alert.status
      }));
    } catch (error) {
      throw new Error(`Failed to get alerts: ${error.message}`);
    }
  },

  // Dismiss an alert
  async dismissAlert(alertId) {
    try {
      const alert = await Alert.findByPk(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update({
        status: 'resolved',
        resolved_at: new Date()
      });

      return alert;
    } catch (error) {
      throw new Error(`Failed to dismiss alert: ${error.message}`);
    }
  },

  // Take action on alert
  async takeActionOnAlert(alertId, action) {
    try {
      const alert = await Alert.findByPk(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update({
        status: 'investigating'
      });

      // Here you could implement specific action logic
      // For now, just mark as investigating
      return alert;
    } catch (error) {
      throw new Error(`Failed to take action on alert: ${error.message}`);
    }
  },

  // Get alert statistics
  async getAlertStats() {
    try {
      const total = await Alert.count();
      const critical = await Alert.count({ where: { severity: 'critical' } });
      const warning = await Alert.count({ where: { severity: 'warning' } });
      const info = await Alert.count({ where: { severity: 'info' } });
      const resolved = await Alert.count({ where: { status: 'resolved' } });

      return {
        total,
        critical,
        warning,
        info,
        resolved,
        active: total - resolved
      };
    } catch (error) {
      throw new Error(`Failed to get alert stats: ${error.message}`);
    }
  },

  // Helper function to format time ago
  formatTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
};

module.exports = alertService;
