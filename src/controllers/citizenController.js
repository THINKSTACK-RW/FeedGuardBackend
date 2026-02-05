const { Citizen } = require('../models');

const citizenController = {
  // Get all citizens
  async getAllCitizens(req, res) {
    try {
      const citizens = await Citizen.findAll();
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get citizen by ID
  async getCitizenById(req, res) {
    try {
      const { id } = req.params;
      const citizen = await Citizen.findByPk(id);
      if (!citizen) {
        return res.status(404).json({ error: 'Citizen not found' });
      }
      res.json(citizen);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new citizen
  async createCitizen(req, res) {
    try {
      const citizen = await Citizen.create(req.body);
      res.status(201).json(citizen);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update citizen
  async updateCitizen(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Citizen.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Citizen not found' });
      }
      const citizen = await Citizen.findByPk(id);
      res.json(citizen);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete citizen
  async deleteCitizen(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Citizen.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Citizen not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = citizenController;
