const { User } = require('../models');

const userController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new user
  async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await User.update(req.body, {
        where: { id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user = await User.findByPk(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await User.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
