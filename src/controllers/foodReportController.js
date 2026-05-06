const { Response, Citizen, Location, Survey } = require('../models');
const { v4: uuidv4 } = require('uuid');
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
  async submitFoodReport(req, res) {
    try {
      const {
        citizen_id,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced = [],
        channel = 'APP'
      } = req.body;

      // Validate required fields
      if (!citizen_id || meals_per_day === undefined || days_of_food_left === undefined || !food_change_type) {
        return res.status(400).json({ 
          error: 'Missing required fields: citizen_id, meals_per_day, days_of_food_left, food_change_type' 
        });
      }

      // Check if citizen exists, create if not (for mobile app users)
      let citizen = await Citizen.findByPk(citizen_id, { include: [Location] });
      if (!citizen) {
        // Create a basic citizen record for mobile app users with default location
        const defaultLocation = await Location.findOne({ where: { name: 'Default Location' } }) ||
          await Location.create({
            name: 'Default Location',
            village: null,
            sector: null,
            district: null,
            country: 'Rwanda',
            province: 'Kigali',
            latitude: -1.9441,
            longitude: 30.0619
          });

        citizen = await Citizen.create({
          id: citizen_id,
          name: 'Mobile App User',
          phone: null,
          location_id: defaultLocation.id, // Always required
          created_at: new Date()
        });
        citizen = await Citizen.findByPk(citizen_id, { include: [Location] });
      }

      // Calculate baseline food security score
      const { food_security_score, risk_level: fallbackRiskLevel } = calculateFoodSecurityMetrics({
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced
      });

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
        id: uuidv4(),
        survey_id: null, // Mobile reports might not be tied to a specific survey
        citizen_id,
        channel,
        meals_per_day,
        days_of_food_left,
        food_change_type,
        shocks_experienced,
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
        }
      });
    } catch (error) {
      console.error('Error submitting food report:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get citizen's report history
  async getReportHistory(req, res) {
    try {
      const { citizen_id } = req.query;
      
      if (!citizen_id) {
        return res.status(400).json({ error: 'citizen_id is required' });
      }

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
      }));

      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get food security statistics for mobile app
  async getFoodSecurityStats(req, res) {
    try {
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
      });

      const stats = {
        totalReports: responses.length,
        riskDistribution: {
          critical: responses.filter(r => r.risk_level === 'critical').length,
          high: responses.filter(r => r.risk_level === 'high').length,
          medium: responses.filter(r => r.risk_level === 'medium').length,
          low: responses.filter(r => r.risk_level === 'low').length
        },
        averageMealsPerDay: responses.reduce((sum, r) => sum + (r.meals_per_day || 0), 0) / responses.length || 0,
        averageDaysOfFood: responses.reduce((sum, r) => sum + (r.days_of_food_left || 0), 0) / responses.length || 0
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// Helper function to calculate food security metrics
function calculateFoodSecurityMetrics(data) {
  let score = 100;
  let risk_level = 'low';

  // Deduct points based on meals per day
  if (data.meals_per_day === 0) {
    score -= 40;
  } else if (data.meals_per_day === 1) {
    score -= 25;
  } else if (data.meals_per_day === 2) {
    score -= 10;
  }

  // Deduct points based on days of food left
  if (data.days_of_food_left === 0) {
    score -= 35;
  } else if (data.days_of_food_left === 1) {
    score -= 20;
  } else if (data.days_of_food_left === 3) {
    score -= 10;
  }

  // Deduct points based on food change
  if (data.food_change_type === 'both') {
    score -= 25;
  } else if (data.food_change_type === 'quantity') {
    score -= 15;
  } else if (data.food_change_type === 'quality') {
    score -= 10;
  }

  // Deduct points for shocks experienced
  const shockPenalty = data.shocks_experienced.length * 5;
  score -= shockPenalty;

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine risk level based on score
  if (score >= 70) {
    risk_level = 'low';
  } else if (score >= 50) {
    risk_level = 'medium';
  } else if (score >= 30) {
    risk_level = 'high';
  } else {
    risk_level = 'critical';
  }

  return {
    food_security_score: score,
    risk_level
  };
}

module.exports = foodReportController;
