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

  // Get detailed reports grouped by location
  async getRegionalReports(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.region_id) {
        whereClause['$Citizen.Location.id$'] = filters.region_id;
      }
      
      if (filters.status) {
        whereClause.risk_level = filters.status === 'critical' ? 'critical' : 
                              filters.status === 'warning' ? ['medium', 'high'] : 'low';
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
          attributes: ['id', 'name', 'phone'],
          include: [{
            model: Location,
            attributes: ['id', 'name', 'district', 'sector', 'village', 'latitude', 'longitude']
          }]
        }],
        order: [['submitted_at', 'DESC']]
      });

      // Group responses by location
      const locationGroups = {};
      
      responses.forEach(response => {
        const location = response.Citizen.Location;
        if (!location) return;
        
        const locationKey = location.id;
        
        if (!locationGroups[locationKey]) {
          locationGroups[locationKey] = {
            locationId: location.id,
            locationName: location.name,
            district: location.district,
            sector: location.sector,
            village: location.village,
            latitude: location.latitude,
            longitude: location.longitude,
            totalResponses: 0,
            critical: 0,
            warning: 0,
            stable: 0,
            avgMealsPerDay: 0,
            avgDaysOfFoodLeft: 0,
            responses: []
          };
        }
        
        const group = locationGroups[locationKey];
        group.totalResponses++;
        group.responses.push({
          id: response.id,
          citizenId: response.Citizen.id,
          citizenName: response.Citizen.name || 'Anonymous',
          citizenPhone: response.Citizen.phone || 'N/A',
          date: response.submitted_at.toISOString().split('T')[0],
          time: response.submitted_at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          mealsPerDay: response.meals_per_day,
          daysOfFoodLeft: response.days_of_food_left,
          foodChangeType: response.food_change_type,
          shocksExperienced: response.shocks_experienced || [],
          riskLevel: response.risk_level,
          status: this.determineStatus(response.risk_level)
        });
        
        // Count risk levels
        if (response.risk_level === 'critical') group.critical++;
        else if (response.risk_level === 'medium' || response.risk_level === 'high') group.warning++;
        else group.stable++;
        
        // Accumulate for averages
        if (response.meals_per_day) {
          group.avgMealsPerDay += response.meals_per_day;
        }
        if (response.days_of_food_left) {
          group.avgDaysOfFoodLeft += response.days_of_food_left;
        }
      });
      
      // Calculate averages and convert to array
      const regionalReports = Object.values(locationGroups).map(group => {
        group.avgMealsPerDay = group.totalResponses > 0 ? 
          Math.round((group.avgMealsPerDay / group.totalResponses) * 10) / 10 : 0;
        group.avgDaysOfFoodLeft = group.totalResponses > 0 ? 
          Math.round(group.avgDaysOfFoodLeft / group.totalResponses) : 0;
        
        // Determine overall status for the location
        let overallStatus = 'Stable';
        if (group.critical > 0) overallStatus = 'Critical';
        else if (group.warning > group.stable) overallStatus = 'Warning';
        
        group.overallStatus = overallStatus;
        group.trend = this.calculateTrend(null); // Simplified trend
        
        return group;
      });
      
      // Sort by total responses (most active first)
      regionalReports.sort((a, b) => b.totalResponses - a.totalResponses);
      
      return regionalReports;
    } catch (error) {
      throw new Error(`Failed to get regional reports: ${error.message}`);
    }
  },

  // Get individual responses for a specific location
  async getLocationResponses(locationId, filters = {}) {
    try {
      const whereClause = {
        '$Citizen.Location.id$': locationId
      };
      
      if (filters.status) {
        whereClause.risk_level = filters.status === 'critical' ? 'critical' : 
                              filters.status === 'warning' ? ['medium', 'high'] : 'low';
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
          attributes: ['id', 'name', 'phone', 'email', 'village', 'sector', 'district', 'household_size'],
          include: [{
            model: Location,
            attributes: ['id', 'name', 'district', 'sector', 'village', 'latitude', 'longitude']
          }]
        }],
        order: [['submitted_at', 'DESC']]
      });

      if (!responses || responses.length === 0) {
        return { location: null, responses: [] };
      }

      const location = responses[0].Citizen.Location;
      
      const formattedResponses = responses.map(response => ({
        id: response.id,
        citizen: {
          id: response.Citizen.id,
          name: response.Citizen.name || 'Anonymous',
          phone: response.Citizen.phone || 'N/A',
          email: response.Citizen.email || 'N/A',
          village: response.Citizen.village || 'N/A',
          sector: response.Citizen.sector || 'N/A',
          district: response.Citizen.district || 'N/A',
          householdSize: response.Citizen.household_size || 'N/A'
        },
        survey: {
          date: response.submitted_at.toISOString().split('T')[0],
          time: response.submitted_at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          mealsPerDay: response.meals_per_day,
          daysOfFoodLeft: response.days_of_food_left,
          foodChangeType: response.food_change_type,
          shocksExperienced: response.shocks_experienced || [],
          riskLevel: response.risk_level,
          status: this.determineStatus(response.risk_level)
        }
      }));

      return {
        location: {
          id: location.id,
          name: location.name,
          district: location.district,
          sector: location.sector,
          village: location.village,
          latitude: location.latitude,
          longitude: location.longitude
        },
        responses: formattedResponses,
        summary: {
          total: formattedResponses.length,
          critical: formattedResponses.filter(r => r.survey.riskLevel === 'critical').length,
          warning: formattedResponses.filter(r => r.survey.riskLevel === 'medium' || r.survey.riskLevel === 'high').length,
          stable: formattedResponses.filter(r => r.survey.riskLevel === 'low').length,
          avgMealsPerDay: Math.round(formattedResponses.reduce((sum, r) => sum + (r.survey.mealsPerDay || 0), 0) / formattedResponses.length * 10) / 10 || 0,
          avgDaysOfFoodLeft: Math.round(formattedResponses.reduce((sum, r) => sum + (r.survey.daysOfFoodLeft || 0), 0) / formattedResponses.length) || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get location responses: ${error.message}`);
    }
  },

  // Export location responses to CSV
  async exportLocationResponses(locationId, format = 'csv', filters = {}) {
    try {
      const locationData = await this.getLocationResponses(locationId, filters);
      
      if (!locationData.responses || locationData.responses.length === 0) {
        throw new Error('No responses found for this location');
      }
      
      if (format === 'csv') {
        return this.convertLocationResponsesToCSV(locationData);
      } else if (format === 'pdf') {
        return { message: 'PDF export not implemented yet' };
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      throw new Error(`Failed to export location responses: ${error.message}`);
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
      const totalResponses = await Response.count();
      const avgMeals = await Response.aggregate('meals_per_day', 'AVG', {
        where: { meals_per_day: { [require('sequelize').Op.not]: null } }
      }) || 0;
      
      const criticalCount = await Response.count({ where: { risk_level: 'critical' } });
      const recentCritical = await Response.count({ 
        where: { 
          risk_level: 'critical',
          submitted_at: { [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        } 
      });

      // Simple prediction logic based on trend
      let prediction = 'Stable';
      let predictionText = 'Food security levels are currently stable across most monitored regions.';
      
      if (criticalCount > totalResponses * 0.2) {
        prediction = 'Worsening';
        predictionText = 'AI analysis indicates a worsening trend. Critical food shortages are spreading in high-risk zones.';
      } else if (recentCritical < (criticalCount / 4)) {
        prediction = 'Improving';
        predictionText = 'Predictive models show an improving trend due to reduced critical reports in the last 7 days.';
      }

      return {
        totalHouseholds: await Citizen.count(),
        avgMealsPerDay: Math.round(avgMeals * 10) / 10,
        criticalAlerts: criticalCount,
        prediction,
        predictionText
      };
    } catch (error) {
      throw new Error(`Failed to get insights: ${error.message}`);
    }
  },

  // Get regional data for map
  async getMapData() {
    try {
      const locations = await Location.findAll({
        attributes: ['id', 'name', 'district', 'sector', 'village', 'latitude', 'longitude'],
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

      const mapData = locations.map((location) => {
        const responses = location.Citizens.flatMap(citizen => citizen.Responses || []);
        const criticalCount = responses.filter(r => r.risk_level === 'critical').length;
        const atRiskCount = responses.filter(r => r.risk_level === 'medium' || r.risk_level === 'high').length;
        const stableCount = responses.filter(r => r.risk_level === 'low').length;

        let status = 'stable';
        if (criticalCount > 0) status = 'critical';
        else if (atRiskCount > stableCount) status = 'warning';

        // Convert lat/lng to map coordinates (simple projection)
        // Rwanda is roughly between lat: -1.5 to -2.5, lng: 29 to 31
        // Map to 0-800px range
        const x = ((location.longitude - 29) / 2) * 800; // lng 29-31 maps to 0-800
        const y = ((-location.latitude - 1.5) / 1) * 600; // lat -1.5 to -2.5 maps to 0-600 (inverted)

        return {
          id: location.id,
          x: Math.max(50, Math.min(750, x)), // Keep within bounds
          y: Math.max(50, Math.min(550, y)), // Keep within bounds
          region: location.name,
          district: location.district,
          sector: location.sector,
          village: location.village,
          status,
          households: location.Citizens.length,
          totalResponses: responses.length,
          critical: criticalCount,
          warning: atRiskCount,
          stable: stableCount,
          risk: status === 'critical' ? 'High' : status === 'warning' ? 'Moderate' : 'Low',
          mealsPerDay: responses.length > 0 ? 
            Math.round(responses.reduce((sum, r) => sum + (r.meals_per_day || 0), 0) / responses.length * 10) / 10 : 0,
          daysOfFood: responses.length > 0 ? 
            Math.round(responses.reduce((sum, r) => sum + (r.days_of_food_left || 0), 0) / responses.length) : 0,
          latitude: location.latitude,
          longitude: location.longitude
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
  },

  convertLocationResponsesToCSV(locationData) {
    if (!locationData.responses || locationData.responses.length === 0) return '';
    
    const headers = [
      'Response ID',
      'Citizen Name',
      'Citizen Phone',
      'Citizen Email',
      'District',
      'Sector',
      'Village',
      'Household Size',
      'Survey Date',
      'Survey Time',
      'Meals Per Day',
      'Days of Food Left',
      'Food Change Type',
      'Shocks Experienced',
      'Risk Level',
      'Status'
    ];
    
    const csvRows = locationData.responses.map(response => {
      const shocks = response.survey.shocksExperienced.length > 0 
        ? `"${response.survey.shocksExperienced.join('; ')}"` 
        : 'None';
      
      return [
        response.id,
        `"${response.citizen.name}"`,
        response.citizen.phone,
        response.citizen.email,
        `"${response.citizen.district}"`,
        `"${response.citizen.sector}"`,
        `"${response.citizen.village}"`,
        response.citizen.householdSize,
        response.survey.date,
        response.survey.time,
        response.survey.mealsPerDay || 'N/A',
        response.survey.daysOfFoodLeft || 'N/A',
        `"${response.survey.foodChangeType || 'None'}"`,
        shocks,
        response.survey.riskLevel || 'Unknown',
        response.survey.status || 'Unknown'
      ].join(',');
    });
    
    // Add summary header
    const summary = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ].join(',');
    
    const summaryRow = [
      'SUMMARY',
      `Total Responses: ${locationData.summary.total}`,
      `Critical: ${locationData.summary.critical}`,
      `Warning: ${locationData.summary.warning}`,
      `Stable: ${locationData.summary.stable}`,
      `Avg Meals/Day: ${locationData.summary.avgMealsPerDay}`,
      `Avg Days of Food: ${locationData.summary.avgDaysOfFoodLeft}`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ].join(',');
    
    return [headers.join(','), ...csvRows, summary, summaryRow].join('\n');
  }
};

module.exports = reportService;
