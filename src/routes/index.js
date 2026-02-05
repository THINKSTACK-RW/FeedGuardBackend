const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const answerRoutes = require('./answerRoutes');
const citizenRoutes = require('./citizenRoutes');
const locationRoutes = require('./locationRoutes');
const questionRoutes = require('./questionRoutes');
const questionLogicRoutes = require('./questionLogicRoutes');
const responseRoutes = require('./responseRoutes');
const surveyRoutes = require('./surveyRoutes');
const userRoutes = require('./userRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/answers', answerRoutes);
router.use('/citizens', citizenRoutes);
router.use('/locations', locationRoutes);
router.use('/questions', questionRoutes);
router.use('/question-logic', questionLogicRoutes);
router.use('/responses', responseRoutes);
router.use('/surveys', surveyRoutes);
router.use('/users', userRoutes);

module.exports = router;
