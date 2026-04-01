const { Response, Citizen, Location, Sequelize } = require('../models');
const { Op } = Sequelize;
const { v4: uuidv4 } = require('uuid');
const PredictionService = require('../services/PredictionService');

const foodReportController = {
  // Submit a new food report with ML prediction
  async submitFoodReport(req, res) {
    console.log('--- FeedGuard JS Controller: submitFoodReport called ---');
    try {
      const {
        citizen_id,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced = [],
        channel = 'APP',
        // Optional ML fields from the report
        income_level = 300,
        farm_size = 1.0,
        livestock_ownership = 2,
        crop_yield = 1.5,
        market_access = 5,
        food_prices_index = 100,
        rainfall_mm = 600
      } = req.body;

      if (!citizen_id || meals_per_day === undefined || days_of_food_left === undefined) {
        return res.status(400).json({ error: 'Missing core reporting fields' });
      }

      // Fetch or Create Citizen
      let citizen = await Citizen.findByPk(citizen_id, { include: [Location] });
      if (!citizen) {
        // Create a basic citizen record for mobile app users with default location
        let defaultLocation = await Location.findOne({ where: { name: 'Default Location' } });
        if (!defaultLocation) {
          defaultLocation = await Location.create({
            name: 'Default Location',
            village: null,
            sector: null,
            district: 'Nyarugenge',
            country: 'Rwanda',
            province: 'Kigali',
            latitude: -1.9441,
            longitude: 30.0619
          });
        }

        citizen = await Citizen.create({
          id: citizen_id,
          name: 'FeedGuard User',
          phone: null,
          location_id: defaultLocation.id,
          created_at: new Date()
        });
        // Refetch to get includes
        citizen = await Citizen.findByPk(citizen_id, { include: [Location] });
      }

      // Prepare data for ML model
      const mlParams = {
        household_size: parseInt(citizen.household_size) || 5,
        income_level,
        farm_size,
        livestock_ownership,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced: Array.isArray(shocks_experienced) ? shocks_experienced[0] || 'No Shock' : 'No Shock',
        market_access,
        food_prices_index,
        rainfall_mm,
        region: citizen.Location ? citizen.Location.province || 'Kigali' : 'Kigali',
        crop_yield
      };

      // Get ML Prediction
      console.log('Requesting ML prediction for citizen:', citizen_id);
      const prediction = await PredictionService.predictRisk(mlParams);

      // Save Report to Database
      const report = await Response.create({
        id: uuidv4(),
        citizen_id,
        channel,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced,
        income_level,
        farm_size,
        livestock_ownership,
        crop_yield,
        market_access,
        food_prices_index,
        rainfall_mm,
        risk_level: prediction.risk_level,
        food_security_score: Math.round(prediction.confidence * 100),
        submitted_at: new Date()
      });

      // If critical, trigger alert generation
      if (report.risk_level === 'critical') {
        try {
          const alertService = require('../services/alertService');
          await alertService.generateAlerts();
          console.log('--- Critical Report: Alert system triggered ---');
        } catch (alertError) {
          console.error('Failed to trigger alert system:', alertError);
        }
      }

      res.status(201).json({
        message: 'FeedGuard Report processed via AI',
        risk_level: report.risk_level,
        confidence: prediction.confidence,
        report_id: report.id
      });

    } catch (error) {
      console.error('FeedGuard API Error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all food reports
  async getAllFoodReports(req, res) {
    try {
      const reports = await Response.findAll({
        include: [{ model: Citizen, include: [Location] }],
        order: [['submitted_at', 'DESC']],
        limit: 100
      });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get history for a specific citizen
  async getReportHistory(req, res) {
    try {
      const { citizen_id } = req.query;
      if (!citizen_id) return res.status(400).json({ error: 'citizen_id is required' });

      const responses = await Response.findAll({
        where: { citizen_id },
        order: [['submitted_at', 'DESC']],
        limit: 50
      });

      const formatted = responses.map(r => ({
        id: r.id,
        date: r.submitted_at.toISOString().split('T')[0],
        time: r.submitted_at.toLocaleTimeString(),
        meals_per_day: r.meals_per_day,
        days_of_food_left: r.days_of_food_left,
        food_change_type: r.food_change_type,
        risk_level: r.risk_level,
        food_security_score: r.food_security_score
      }));

      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get dashboard statistics
  async getFoodReportStats(req, res) {
    try {
      const totalCount = await Response.count();
      const riskLevels = await Response.findAll({
        attributes: ['risk_level', [Sequelize.fn('COUNT', Sequelize.col('risk_level')), 'count']],
        group: ['risk_level']
      });

      const stats = {
        totalReports: totalCount,
        riskDistribution: riskLevels.reduce((acc, curr) => {
          acc[curr.risk_level] = parseInt(curr.get('count'));
          return acc;
        }, { low: 0, medium: 0, high: 0, critical: 0 })
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get trends analysis
  async getFoodReportTrends(req, res) {
    try {
      const period = req.query.period || '30d';
      const days = parseInt(period) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Response.findAll({
        where: { submitted_at: { [Op.gte]: startDate } },
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('submitted_at')), 'date'],
          [Sequelize.fn('AVG', Sequelize.col('food_security_score')), 'avg_score']
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('submitted_at'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('submitted_at')), 'ASC']]
      });

      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get regional breakdown
  async getRegionalFoodReports(req, res) {
    try {
      const regionalData = await Response.findAll({
        include: [{ 
          model: Citizen, 
          include: [{ model: Location, attributes: ['province', 'district'] }] 
        }],
        limit: 200
      });
      res.json(regionalData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = foodReportController;
