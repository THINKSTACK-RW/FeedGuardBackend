const { Question } = require('../models');

const questionController = {
  // Get all questions
  async getAllQuestions(req, res) {
    try {
      const questions = await Question.findAll();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get question by ID
  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await Question.findByPk(id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new question
  async createQuestion(req, res) {
    try {
      const question = await Question.create(req.body);
      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update question
  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Question.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Question not found' });
      }
      const question = await Question.findByPk(id);
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete question
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Question.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = questionController;
