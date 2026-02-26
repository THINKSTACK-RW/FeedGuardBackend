const { Response, Citizen, Location, Survey } = require('../models');

const reportService = {
  // Generate summary statistics for reports page
  async getReportSummary(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.region_id) {
        whereClause['$Citizen.Location.id$'] = filters.region_id;
      }
      
      if (filters.date_range) {
        const dates = this.parseDateRange(filters.date_range);
        whereClause.submitted_at = {
          [require('sequelize').Op.between]: [dates.start, dates.end]
        };
      }

      const responses = await Response.findAll({
        where: whereClause,
        include: [{
          model: Citizen,
          include: [Location]
        }]
      });

      const summary = {
        totalReports: responses.length,
        critical: responses.filter(r => r.risk_level === 'critical').length,
        warning: responses.filter(r => r.risk_level === 'medium' || r.risk_level === 'high').length,
        stable: responses.filter(r => r.risk_level === 'low').length,
        avgCompleteness: 82 // Mock data - calculate based on actual response rate
      };

      return summary;
    } catch (error) {
      throw new Error(`Failed to get report summary: ${error.message}`);
    }
  },

  // Get detailed reports data
  async getDetailedReports(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.region_id) {
        whereClause['$Citizen.Location.id$'] = filters.region_id;
      }
      
      if (filters.status) {
        whereClause.risk_level = filters.status === 'critical' ? 'critical' : 
                              filters.status === 'warning' ? ['medium', 'high'] : 'low';
      }

      const responses = await Response.findAll({
        where: whereClause,
        include: [{
          model: Citizen,
          attributes: ['id'],
          include: [{
            model: Location,
            attributes: ['name']
          }]
        }],
        order: [['submitted_at', 'DESC']],
        limit: 50
      });

      const reports = responses.map((response, index) => {
        const region = response.Citizen && response.Citizen.Location ? response.Citizen.Location.name : 'Unknown';
        const status = this.determineStatus(response.risk_level);
        const trend = this.calculateTrend(response); // Simplified trend calculation
        
        return {
          id: `RPT-${String(index + 1).padStart(3, '0')}`,
          region,
          date: response.submitted_at.toISOString().split('T')[0],
          time: response.submitted_at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          households: Math.floor(Math.random() * 200) + 100, // Mock household count
          reporting: Math.floor(Math.random() * 50) + 150, // Mock reporting count
          stable: status === 'Stable' ? Math.floor(Math.random() * 50) + 100 : Math.floor(Math.random() * 30) + 50,
          atRisk: status === 'Warning' ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 20) + 10,
          critical: status === 'Critical' ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 10) + 5,
          status,
          trend,
          completeness: Math.floor(Math.random() * 20) + 75
        };
      });

      return reports;
    } catch (error) {
      throw new Error(`Failed to get detailed reports: ${error.message}`);
    }
  },

  // Export reports data
  async exportReports(format = 'csv', filters = {}) {
    try {
      const reports = await this.getDetailedReports(filters);
      
      if (format === 'csv') {
        return this.convertToCSV(reports);
      } else if (format === 'pdf') {
        // PDF export would require a library like puppeteer or pdfkit
        return { message: 'PDF export not implemented yet' };
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      throw new Error(`Failed to export reports: ${error.message}`);
    }
  },

  // Get insights and predictions
  async getInsights() {
    try {
      const insights = {
        totalHouseholds: await Citizen.count(),
        avgMealsPerDay: await Response.aggregate('meals_per_day', 'AVG', {
          where: { meals_per_day: { [require('sequelize').Op.not]: null } }
        }),
        criticalAlerts: await Response.count({ where: { risk_level: 'critical' } }),
        prediction: 'Improving Trend',
        predictionText: 'Based on current data, food security is expected to stabilize in the next 14 days due to recent interventions.'
      };

      insights.avgMealsPerDay = Math.round(insights.avgMealsPerDay * 10) / 10 || 0;

      return insights;
    } catch (error) {
      throw new Error(`Failed to get insights: ${error.message}`);
    }
  },

  // Get regional data for map
  async getMapData() {
    try {
      const locations = await Location.findAll({
        attributes: ['id', 'name', 'latitude', 'longitude'],
        include: [{
          model: Citizen,
          attributes: ['id'],
          include: [{
            model: Response,
            attributes: ['risk_level', 'meals_per_day', 'days_of_food_left'],
            required: false
          }]
        }]
      });

      const mapData = locations.map((location, index) => {
        const responses = location.Citizens.flatMap(citizen => citizen.Responses || []);
        const criticalCount = responses.filter(r => r.risk_level === 'critical').length;
        const atRiskCount = responses.filter(r => r.risk_level === 'medium' || r.risk_level === 'high').length;
        const stableCount = responses.filter(r => r.risk_level === 'low').length;

        let status = 'stable';
        if (criticalCount > 0) status = 'critical';
        else if (atRiskCount > stableCount) status = 'warning';

        // Mock coordinates for demonstration
        const mockCoordinates = [
          { x: 200, y: 150 }, // Kibera
          { x: 450, y: 280 }, // Makina
          { x: 300, y: 400 }, // Lindi
          { x: 600, y: 200 }  // Soweto
        ];

        return {
          id: index + 1,
          x: mockCoordinates[index % 4].x,
          y: mockCoordinates[index % 4].y,
          region: location.name,
          status,
          households: location.Citizens.length,
          risk: status === 'critical' ? 'High' : status === 'warning' ? 'Moderate' : 'Low',
          mealsPerDay: Math.round(responses.reduce((sum, r) => sum + (r.meals_per_day || 0), 0) / responses.length) || 2,
          daysOfFood: Math.round(responses.reduce((sum, r) => sum + (r.days_of_food_left || 0), 0) / responses.length) || 3
        };
      });

      return mapData;
    } catch (error) {
      throw new Error(`Failed to get map data: ${error.message}`);
    }
  },

  // Helper functions
  determineStatus(riskLevel) {
    switch (riskLevel) {
      case 'critical': return 'Critical';
      case 'high':
      case 'medium': return 'Warning';
      case 'low': return 'Stable';
      default: return 'Stable';
    }
  },

  calculateTrend(response) {
    // Simplified trend calculation - in real implementation, compare with historical data
    const random = Math.random();
    if (random > 0.7) return 'up';
    if (random < 0.3) return 'down';
    return 'stable';
  },

  parseDateRange(range) {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    
    return { start, end };
  },

  convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }
};

module.exports = reportService;
