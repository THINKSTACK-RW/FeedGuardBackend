const { Response } = require('../models');

const responseController = {
  // Get all responses
  async getAllResponses(req, res) {
    try {
      const responses = await Response.findAll();
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get response by ID
  async getResponseById(req, res) {
    try {
      const { id } = req.params;
      const response = await Response.findByPk(id);
      if (!response) {
        return res.status(404).json({ error: 'Response not found' });
      }
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new response
  async createResponse(req, res) {
    try {
      const response = await Response.create(req.body);
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update response
  async updateResponse(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Response.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Response not found' });
      }
      const response = await Response.findByPk(id);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete response
  async deleteResponse(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Response.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Response not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = responseController;
