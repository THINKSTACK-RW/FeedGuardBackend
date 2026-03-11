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

// New routes for enhanced functionality
const dashboardRoutes = require('./dashboardRoutes');
const alertsRoutes = require('./alertsRoutes');
const reportsRoutes = require('./reportsRoutes');
const mapRoutes = require('./mapRoutes');
const foodReportRoutes = require('./foodReportRoutes');
const smsRoutes = require('./smsRoutes');
const apiDocsRoutes = require('./apiDocsRoutes');
const mobileAuthRoutes = require('./mobileAuthRoutes');

// Mount existing routes
router.use('/auth', authRoutes);
router.use('/answers', answerRoutes);
router.use('/citizens', citizenRoutes);
router.use('/locations', locationRoutes);
router.use('/questions', questionRoutes);
router.use('/question-logic', questionLogicRoutes);
router.use('/responses', responseRoutes);
router.use('/surveys', surveyRoutes);
router.use('/users', userRoutes);

// Mount new routes
router.use('/dashboard', dashboardRoutes);
router.use('/alerts', alertsRoutes);
router.use('/reports', reportsRoutes);
router.use('/map', mapRoutes);
router.use('/food-reports', foodReportRoutes);
router.use('/sms', smsRoutes);
router.use('/mobile-auth', mobileAuthRoutes);

// Mount API docs route at root level
router.use('/api-docs', apiDocsRoutes);



module.exports = router;
