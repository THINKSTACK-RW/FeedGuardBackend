const smsService = require('../services/smsService');
const { Survey, Citizen } = require('../models');

const smsController = {
  // Start SMS survey for a citizen
  async startSMSSurvey(req, res) {
    try {
      const { citizen_id, survey_id } = req.body;

      if (!citizen_id || !survey_id) {
        return res.status(400).json({ 
          error: 'citizen_id and survey_id are required' 
        });
      }

      const result = await smsService.startSMSSurvey(citizen_id, survey_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Receive incoming SMS (webhook from SMS provider)
  async receiveSMS(req, res) {
    try {
      const { from, message } = req.body;
      
      // Different SMS providers send different formats
      // Twilio: From, Body
      // Africa's Talking: from, text
      const phoneNumber = from || req.body.from;
      const messageText = message || req.body.text || req.body.Body;

      if (!phoneNumber || !messageText) {
        return res.status(400).json({ error: 'Invalid SMS format' });
      }

      await smsService.handleIncomingSMS(phoneNumber, messageText);
      
      // Respond quickly to SMS provider webhook
      res.status(200).send('<Response/>'); // Twilio format
    } catch (error) {
      console.error('Error processing SMS:', error);
      res.status(500).send('<Response/>');
    }
  },

  // Send survey invitations to multiple citizens
  async sendSurveyInvitations(req, res) {
    try {
      const { survey_id, region_ids } = req.body;

      if (!survey_id) {
        return res.status(400).json({ 
          error: 'survey_id is required' 
        });
      }

      const result = await smsService.sendSurveyInvitations(survey_id, region_ids);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get SMS service statistics
  async getSMSStats(req, res) {
    try {
      const stats = {
        activeSessions: smsService.getActiveSessionsCount(),
        totalCitizens: await Citizen.count(),
        publishedSurveys: await Survey.count({ where: { status: 'PUBLISHED' } })
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create food security survey template
  async createFoodSecuritySurvey(req, res) {
    try {
      const { title, description, region_ids } = req.body;

      // Create survey with standard food security questions
      const survey = await Survey.create({
        title: title || 'Food Security Assessment',
        description: description || 'Standard food security monitoring survey',
        status: 'PUBLISHED',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_by: req.user?.id // If authenticated
      });

      // Create standard questions (simplified - in production, use QuestionController)
      const standardQuestions = [
        {
          survey_id: survey.id,
          text: 'How many meals did your household eat yesterday?',
          type: 'meals_per_day',
          order_index: 1,
          is_required: true
        },
        {
          survey_id: survey.id,
          text: 'How many days of food does your household have left?',
          type: 'days_of_food',
          order_index: 2,
          is_required: true
        },
        {
          survey_id: survey.id,
          text: 'Have you reduced food quantity or quality recently?',
          type: 'food_change',
          order_index: 3,
          is_required: true
        },
        {
          survey_id: survey.id,
          text: 'Which shocks have you experienced recently? (Select all that apply)',
          type: 'shocks',
          order_index: 4,
          is_required: false
        }
      ];

      // In production, use Question.bulkCreate()
      res.json({
        survey,
        questions: standardQuestions,
        message: 'Food security survey created successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = smsController;
