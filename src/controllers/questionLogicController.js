const { QuestionLogic } = require('../models');

const questionLogicController = {
  // Get all question logic
  async getAllQuestionLogic(req, res) {
    try {
      const questionLogic = await QuestionLogic.findAll();
      res.json(questionLogic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get question logic by ID
  async getQuestionLogicById(req, res) {
    try {
      const { id } = req.params;
      const questionLogic = await QuestionLogic.findByPk(id);
      if (!questionLogic) {
        return res.status(404).json({ error: 'QuestionLogic not found' });
      }
      res.json(questionLogic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new question logic
  async createQuestionLogic(req, res) {
    try {
      const questionLogic = await QuestionLogic.create(req.body);
      res.status(201).json(questionLogic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update question logic
  async updateQuestionLogic(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await QuestionLogic.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'QuestionLogic not found' });
      }
      const questionLogic = await QuestionLogic.findByPk(id);
      res.json(questionLogic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete question logic
  async deleteQuestionLogic(req, res) {
    try {
      const { id } = req.params;
      const deleted = await QuestionLogic.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'QuestionLogic not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = questionLogicController;
