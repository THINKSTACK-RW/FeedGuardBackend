const { Location } = require('../models');

const locationController = {
  // Get all locations
  async getAllLocations(req, res) {
    try {
      const locations = await Location.findAll();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get location by ID
  async getLocationById(req, res) {
    try {
      const { id } = req.params;
      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new location
  async createLocation(req, res) {
    try {
      const location = await Location.create(req.body);
      res.status(201).json(location);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update location
  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Location.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Location not found' });
      }
      const location = await Location.findByPk(id);
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete location
  async deleteLocation(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Location.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = locationController;
