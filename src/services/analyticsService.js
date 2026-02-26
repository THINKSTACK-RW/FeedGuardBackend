const { Response, Citizen, Location } = require('../models');

const analyticsService = {
  // Calculate dashboard statistics
  async getDashboardStats() {
    try {
      const totalHouseholds = await Citizen.count();
      const criticalAlerts = await Response.count({
        where: { risk_level: 'critical' },
        include: [{
          model: Citizen,
          include: [Location]
        }]
      });
      
      const avgMealsPerDay = await Response.aggregate('meals_per_day', 'AVG', {
        where: { meals_per_day: { [require('sequelize').Op.not]: null } }
      });

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentResponses = await Response.count({
        where: {
          submitted_at: { [require('sequelize').Op.gte]: last30Days }
        }
      });

      return {
        totalHouseholds,
        criticalAlerts,
        avgMealsPerDay: Math.round(avgMealsPerDay * 10) / 10 || 0,
        recentResponses,
        growth: '+12%' // Mock growth percentage
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  },

  // Get trends data for charts
  async getTrendsData(period = '7d') {
    try {
      let days = 7;
      if (period === '30d') days = 30;
      if (period === '90d') days = 90;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const responses = await Response.findAll({
        where: {
          submitted_at: { [require('sequelize').Op.gte]: startDate }
        },
        attributes: [
          [require('sequelize').fn('DATE', require('sequelize').col('submitted_at')), 'date'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN risk_level = \'low\' THEN 1 END')), 'stable'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN risk_level IN (\'medium\', \'high\') THEN 1 END')), 'atRisk'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN risk_level = \'critical\' THEN 1 END')), 'critical']
        ],
        group: [require('sequelize').fn('DATE', require('sequelize').col('submitted_at'))],
        order: [[require('sequelize').fn('DATE', require('sequelize').col('submitted_at')), 'ASC']]
      });

      // Format data for frontend
      const formattedData = responses.map(response => ({
        name: new Date(response.dataValues.date).toLocaleDateString('en-US', { weekday: 'short' }),
        stable: parseInt(response.dataValues.stable) || 0,
        atRisk: parseInt(response.dataValues.atRisk) || 0,
        critical: parseInt(response.dataValues.critical) || 0
      }));

      return formattedData;
    } catch (error) {
      throw new Error(`Failed to get trends data: ${error.message}`);
    }
  },

  // Get regional breakdown
  async getRegionalBreakdown() {
    try {
      const regions = await Location.findAll({
        attributes: ['id', 'name'],
        include: [{
          model: Citizen,
          attributes: ['id'],
          include: [{
            model: Response,
            attributes: ['risk_level'],
            required: false
          }]
        }]
      });

      const regionalData = regions.map(region => {
        const totalHouseholds = region.Citizens.length;
        const responses = region.Citizens.flatMap(citizen => citizen.Responses || []);
        const criticalCount = responses.filter(r => r.risk_level === 'critical').length;
        const atRiskCount = responses.filter(r => r.risk_level === 'medium' || r.risk_level === 'high').length;
        const stableCount = responses.filter(r => r.risk_level === 'low').length;

        let risk = 'Stable';
        let trend = 'down';
        let status = 'Good';

        const criticalPercentage = (criticalCount / totalHouseholds) * 100;
        const atRiskPercentage = (atRiskCount / totalHouseholds) * 100;

        if (criticalPercentage > 10) {
          risk = 'Critical';
          trend = 'up';
          status = 'Action Req';
        } else if (atRiskPercentage > 20) {
          risk = 'Warning';
          trend = 'up';
          status = 'Monitor';
        }

        return {
          region: region.name,
          households: totalHouseholds.toString(),
          risk,
          trend,
          status,
          critical: criticalCount,
          atRisk: atRiskCount,
          stable: stableCount
        };
      });

      return regionalData;
    } catch (error) {
      throw new Error(`Failed to get regional breakdown: ${error.message}`);
    }
  },

  // Get meal frequency analysis
  async getMealFrequencyAnalysis() {
    try {
      const mealData = await Response.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN meals_per_day = 0 THEN 1 END')), 'zeroMeals'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN meals_per_day = 1 THEN 1 END')), 'oneMeal'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN meals_per_day = 2 THEN 1 END')), 'twoMeals'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN meals_per_day >= 3 THEN 1 END')), 'threePlusMeals']
        ],
        where: { meals_per_day: { [require('sequelize').Op.not]: null } }
      });

      const data = mealData[0].dataValues;
      const total = parseInt(data.zeroMeals) + parseInt(data.oneMeal) + parseInt(data.twoMeals) + parseInt(data.threePlusMeals);

      return [
        { name: "0 Meals", value: Math.round((parseInt(data.zeroMeals) / total) * 100), fill: "#ef4444" },
        { name: "1 Meal", value: Math.round((parseInt(data.oneMeal) / total) * 100), fill: "#f59e0b" },
        { name: "2 Meals", value: Math.round((parseInt(data.twoMeals) / total) * 100), fill: "#10b981" },
        { name: "3+ Meals", value: Math.round((parseInt(data.threePlusMeals) / total) * 100), fill: "#3b82f6" }
      ];
    } catch (error) {
      throw new Error(`Failed to get meal frequency analysis: ${error.message}`);
    }
  }
};

module.exports = analyticsService;
