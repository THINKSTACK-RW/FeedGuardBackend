const { Answer } = require('../models');

const answerController = {
  // Get all answers
  async getAllAnswers(req, res) {
    try {
      const answers = await Answer.findAll();
      res.json(answers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get answer by ID
  async getAnswerById(req, res) {
    try {
      const { id } = req.params;
      const answer = await Answer.findByPk(id);
      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }
      res.json(answer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new answer
  async createAnswer(req, res) {
    try {
      const answer = await Answer.create(req.body);
      res.status(201).json(answer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update answer
  async updateAnswer(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Answer.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Answer not found' });
      }
      const answer = await Answer.findByPk(id);
      res.json(answer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete answer
  async deleteAnswer(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Answer.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Answer not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = answerController;
