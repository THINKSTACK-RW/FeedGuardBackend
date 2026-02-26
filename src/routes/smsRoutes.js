const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');

// POST /api/sms/start - Start SMS survey for citizen
router.post('/start', smsController.startSMSSurvey);

// POST /api/sms/receive - Receive incoming SMS (webhook)
router.post('/receive', smsController.receiveSMS);

// POST /api/sms/invite - Send survey invitations
router.post('/invite', smsController.sendSurveyInvitations);

// GET /api/sms/stats - Get SMS service statistics
router.get('/stats', smsController.getSMSStats);

// POST /api/sms/create-survey - Create food security survey
router.post('/create-survey', smsController.createFoodSecuritySurvey);

module.exports = router;
