const { Response, Citizen, Location, Sequelize } = require('../models');
const { Op } = Sequelize;
const { v4: uuidv4 } = require('uuid');
<<<<<<< HEAD
const aiPredictionService = require('../services/aiPredictionService');

const foodReportController = {
  // Preview AI risk prediction before report submission
  async predictFoodRisk(req, res) {
    try {
      const {
        citizen_id,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced = []
      } = req.body;

      if (meals_per_day === undefined || days_of_food_left === undefined || !food_change_type) {
        return res.status(400).json({
          error: 'Missing required fields: meals_per_day, days_of_food_left, food_change_type'
        });
      }

      let citizen = null;
      let location = null;
      if (citizen_id) {
        citizen = await Citizen.findByPk(citizen_id, { include: [Location] });
        location = citizen?.Location || null;
      }

      const aiInput = {
        citizen,
        location,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced
      };

      const prediction = await aiPredictionService.predictRisk(aiInput);
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Submit a new food report from mobile app
=======
const PredictionService = require('../services/PredictionService');

const foodReportController = {
  // Submit a new food report with ML prediction
>>>>>>> b5c7b78d9000059044ac8c238f6d553193db85c3
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

<<<<<<< HEAD
      // Check if citizen exists, create if not (for mobile app users)
=======
      // Fetch or Create Citizen
>>>>>>> b5c7b78d9000059044ac8c238f6d553193db85c3
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
<<<<<<< HEAD
        citizen = await Citizen.findByPk(citizen_id, { include: [Location] });
      }

      // Calculate baseline food security score
      const { food_security_score, risk_level: fallbackRiskLevel } = calculateFoodSecurityMetrics({
=======
        // Refetch to get includes
        citizen = await Citizen.findByPk(citizen_id, { include: [Location] });
      }

      // Prepare data for ML model
      const mlParams = {
        household_size: parseInt(citizen.household_size) || 5,
        income_level,
        farm_size,
        livestock_ownership,
>>>>>>> b5c7b78d9000059044ac8c238f6d553193db85c3
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

<<<<<<< HEAD
      // Use rule-based prediction only (AI prediction disabled due to timeout issues)
      let risk_level = fallbackRiskLevel;
      let prediction_source = 'rules';
      
      // Temporarily disabled AI prediction
      // try {
      //   const prediction = await aiPredictionService.predictRisk({
      //     citizen,
      //     location: citizen?.Location || null,
      //     meals_per_day,
      //     days_of_food_left,
      //     food_change_type,
      //     shocks_experienced
      //   });
      //   risk_level = prediction.risk_level;
      //   prediction_source = prediction.source;
      // } catch (predictionError) {
      //   console.warn('AI prediction unavailable, using fallback rules:', predictionError.message);
      // }

      // Create response record
      const response = await Response.create({
=======
      // Get ML Prediction
      console.log('Requesting ML prediction for citizen:', citizen_id);
      const prediction = await PredictionService.predictRisk(mlParams);

      // Save Report to Database
      const report = await Response.create({
>>>>>>> b5c7b78d9000059044ac8c238f6d553193db85c3
        id: uuidv4(),
        citizen_id,
        channel,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced,
<<<<<<< HEAD
        food_security_score,
        risk_level,
        // ai_confidence, // Commented out - column doesn't exist in database
        submitted_at: new Date()
      });

      res.status(201).json({
        message: 'Food report submitted successfully',
        response: {
          id: response.id,
          food_security_score,
          risk_level,
          confidence: null, // AI confidence not available due to missing column
          prediction_source,
          submitted_at: response.submitted_at
=======
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
>>>>>>> b5c7b78d9000059044ac8c238f6d553193db85c3
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
        attributes: [
          'id', 'survey_id', 'citizen_id', 'channel', 'submitted_at',
          'food_security_score', 'risk_level', 'meals_per_day', 
          'days_of_food_left', 'food_change_type', 'shocks_experienced'
        ],
        order: [['submitted_at', 'DESC']],
        limit: 50
      });

<<<<<<< HEAD
      const reports = responses.map(response => ({
        id: response.id,
        date: response.submitted_at.toISOString().split('T')[0],
        time: response.submitted_at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        meals_per_day: response.meals_per_day,
        days_of_food_left: response.days_of_food_left,
        food_change_type: response.food_change_type,
        shocks_experienced: response.shocks_experienced,
        risk_level: response.risk_level,
        food_security_score: response.food_security_score,
        ai_confidence: null // Column doesn't exist in database
=======
      const formatted = responses.map(r => ({
        id: r.id,
        date: r.submitted_at.toISOString().split('T')[0],
        time: r.submitted_at.toLocaleTimeString(),
        meals_per_day: r.meals_per_day,
        days_of_food_left: r.days_of_food_left,
        food_change_type: r.food_change_type,
        risk_level: r.risk_level,
        food_security_score: r.food_security_score
>>>>>>> b5c7b78d9000059044ac8c238f6d553193db85c3
      }));

      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get dashboard statistics
  async getFoodReportStats(req, res) {
    try {
<<<<<<< HEAD
      const { region_id } = req.query;
      
      const whereClause = {};
      if (region_id) {
        whereClause['$Citizen.Location.id$'] = region_id;
      }

      const responses = await Response.findAll({
        where: whereClause,
        attributes: [
          'id', 'survey_id', 'citizen_id', 'channel', 'submitted_at',
          'food_security_score', 'risk_level', 'meals_per_day', 
          'days_of_food_left', 'food_change_type', 'shocks_experienced'
        ],
        include: [{
          model: Citizen,
          include: [Location]
        }]
=======
      const totalCount = await Response.count();
      const riskLevels = await Response.findAll({
        attributes: ['risk_level', [Sequelize.fn('COUNT', Sequelize.col('risk_level')), 'count']],
        group: ['risk_level']
>>>>>>> b5c7b78d9000059044ac8c238f6d553193db85c3
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
