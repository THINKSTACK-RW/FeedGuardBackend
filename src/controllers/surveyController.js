const { Survey } = require('../models');

const surveyController = {
  // Get all surveys
  async getAllSurveys(req, res) {
    try {
      const surveys = await Survey.findAll();
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get survey by ID
  async getSurveyById(req, res) {
    try {
      const { id } = req.params;
      const survey = await Survey.findByPk(id);
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }
      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new survey
  async createSurvey(req, res) {
    try {
      const survey = await Survey.create(req.body);
      res.status(201).json(survey);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update survey
  async updateSurvey(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Survey.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Survey not found' });
      }
      const survey = await Survey.findByPk(id);
      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete survey
  async deleteSurvey(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Survey.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Survey not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = surveyController;
