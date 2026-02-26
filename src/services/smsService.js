const { Response, Citizen, Survey, Question, Answer } = require('../models');
const { v4: uuidv4 } = require('uuid');

class SMSService {
  constructor() {
    // Africa's Talking integration optimized for African markets
    this.smsProvider = this.initializeSMSProvider();
    this.ussdProvider = this.initializeUSSDProvider();
    this.activeSessions = new Map(); // Track ongoing SMS conversations
    this.ussdSessions = new Map(); // Track USSD sessions
  }

  // Initialize Africa's Talking SMS service
  initializeSMSProvider() {
    const africastalking = require('africastalking')({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME,
      format: 'json',
      debug: process.env.NODE_ENV === 'development',
      options: {
        // Africa's Talking specific options
        enqueue: true,
        bulkSMSMode: true // Enable bulk SMS for better rates
      }
    });

    return {
      sendSMS: async (to, message) => {
        try {
          console.log(`Sending SMS to ${to}: ${message}`);
          
          // Format phone number for African markets
          const formattedPhone = this.formatPhoneNumber(to);
          
          const options = {
            to: [formattedPhone],
            message: message,
            enqueue: true,
            // Africa's Talking specific features
            priority: 'high', // or 'low' for cost savings
            retryDurationInHours: 6 // Retry failed messages for 6 hours
          };

          // Configure sender ID with priority order
          if (process.env.AT_SENDER_ID && process.env.AT_SENDER_ID.trim() !== '') {
            options.from = process.env.AT_SENDER_ID;
            console.log(`Using custom sender ID: ${process.env.AT_SENDER_ID}`);
          } else if (process.env.SMS_NUMBER && process.env.SMS_NUMBER.trim() !== '') {
            options.from = process.env.SMS_NUMBER;
            console.log(`Using phone number sender: ${process.env.SMS_NUMBER}`);
          } else {
            console.log('No sender ID configured - using Africa\'s Talking default sender');
          }

          const result = await africastalking.SMS.send(options);
          
          if (result.SMSMessageData.Recipients.length > 0) {
            const recipient = result.SMSMessageData.Recipients[0];
            if (recipient.status === 'Success') {
              return { 
                success: true, 
                messageId: recipient.messageId,
                cost: recipient.cost,
                status: recipient.status,
                networkCode: recipient.networkCode // Mobile network (MTN, Safaricom, etc.)
              };
            } else {
              throw new Error(`SMS delivery failed: ${recipient.status} - ${recipient.statusCode || 'Unknown'}`);
            }
          } else {
            throw new Error('No recipients returned from Africa\'s Talking');
          }
        } catch (error) {
          console.error('Africa\'s Talking SMS error:', error);
          // Fallback to mock for development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[MOCK] SMS to ${to}: ${message}`);
            return { success: true, messageId: 'mock_' + Date.now() };
          }
          throw error;
        }
      },
      
      receiveSMS: async (from, message) => {
        return this.handleIncomingSMS(from, message);
      },

      // Get SMS delivery status
      getDeliveryStatus: async (messageId) => {
        try {
          const result = await africastalking.SMS.getStatus(messageId);
          return result;
        } catch (error) {
          console.error('Error getting delivery status:', error);
          return null;
        }
      },

      // Get account balance
      getBalance: async () => {
        try {
          const result = await africastalking.Application.getData();
          return {
            balance: result.UserData.balance,
            currency: result.UserData.currency
          };
        } catch (error) {
          console.error('Error getting balance:', error);
          return null;
        }
      },

      // Send bulk SMS for survey invitations
      sendBulkSMS: async (phoneNumbers, message) => {
        try {
          const formattedPhones = phoneNumbers.map(phone => this.formatPhoneNumber(phone));
          
          const options = {
            to: formattedPhones,
            message: message,
            enqueue: true,
            bulkSMSMode: true,
            priority: 'low' // Lower priority for bulk to save costs
          };

          // Configure sender ID with priority order
          if (process.env.AT_SENDER_ID && process.env.AT_SENDER_ID.trim() !== '') {
            options.from = process.env.AT_SENDER_ID;
            console.log(`Using custom sender ID: ${process.env.AT_SENDER_ID}`);
          } else if (process.env.SMS_NUMBER && process.env.SMS_NUMBER.trim() !== '') {
            options.from = process.env.SMS_NUMBER;
            console.log(`Using phone number sender: ${process.env.SMS_NUMBER}`);
          } else {
            console.log('No sender ID configured - using Africa\'s Talking default sender');
          }

          const result = await africastalking.SMS.send(options);
          return {
            success: true,
            totalRecipients: result.SMSMessageData.Recipients.length,
            successfulDeliveries: result.SMSMessageData.Recipients.filter(r => r.status === 'Success').length,
            failedDeliveries: result.SMSMessageData.Recipients.filter(r => r.status !== 'Success').length,
            totalCost: result.SMSMessageData.Recipients.reduce((sum, r) => sum + parseFloat(r.cost || 0), 0)
          };
        } catch (error) {
          console.error('Bulk SMS error:', error);
          throw error;
        }
      }
    };
  }

  // Initialize USSD provider for interactive surveys
  initializeUSSDProvider() {
    const africastalking = require('africastalking')({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME
    });

    return {
      initiateUSSD: async (phoneNumber, ussdCode) => {
        try {
          const result = await africastalking.USSD.initiate({
            phoneNumber: this.formatPhoneNumber(phoneNumber),
            USSDCode: ussdCode
          });
          return result;
        } catch (error) {
          console.error('USSD initiation error:', error);
          throw error;
        }
      }
    };
  }

  // Format phone numbers for African markets
  formatPhoneNumber(phoneNumber) {
    // Remove spaces, dashes, parentheses
    let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ensure country code for East Africa (Rwanda: +250, Kenya: +254, etc.)
    if (!formatted.startsWith('+')) {
      // Default to Rwanda country code if no country code present
      if (formatted.startsWith('07') || formatted.startsWith('25')) {
        formatted = '+250' + formatted.replace(/^0+/, '');
      } else {
        formatted = '+' + formatted;
      }
    }
    
    return formatted;
  }

  // Get mobile network from phone number
  getMobileNetwork(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    
    // Rwanda mobile network prefixes
    const rwandaNetworks = {
      '078': 'MTN',
      '079': 'Airtel', 
      '073': 'MTN',
      '072': 'Airtel',
      '075': 'Tigo'
    };
    
    // Kenya mobile network prefixes
    const kenyaNetworks = {
      '+2547': 'Safaricom',
      '+2541': 'Airtel',
      '+2547': 'Telkom'
    };
    
    // Extract prefix based on country
    if (formatted.startsWith('+250')) {
      const prefix = formatted.substring(3, 5);
      return rwandaNetworks[prefix] || 'Unknown';
    } else if (formatted.startsWith('+254')) {
      const prefix = formatted.substring(3, 6);
      return kenyaNetworks[prefix] || 'Unknown';
    }
    
    return 'Unknown';
  }

  // Start SMS survey for a citizen
  async startSMSSurvey(citizenId, surveyId) {
    try {
      const citizen = await Citizen.findByPk(citizenId);
      const survey = await Survey.findByPk(surveyId, {
        include: [Question]
      });

      if (!citizen || !survey) {
        throw new Error('Citizen or Survey not found');
      }

      // Create response session
      const responseId = uuidv4();
      const session = {
        responseId,
        citizenId,
        surveyId,
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date()
      };

      this.activeSessions.set(citizen.phone_number, session);

      // Send first question
      await this.sendQuestion(citizen.phone_number, survey.Questions[0], 1, survey.Questions.length);

      return { success: true, responseId };
    } catch (error) {
      throw new Error(`Failed to start SMS survey: ${error.message}`);
    }
  }

  // Handle incoming SMS responses
  async handleIncomingSMS(from, message) {
    try {
      const session = this.activeSessions.get(from);
      if (!session) {
        await this.sendWelcomeMessage(from);
        return;
      }

      const messageText = message.trim().toLowerCase();
      
      // Handle special commands
      if (messageText === 'stop' || messageText === 'cancel') {
        await this.cancelSurvey(from);
        return;
      }

      if (messageText === 'restart') {
        await this.restartSurvey(from);
        return;
      }

      // Process answer
      await this.processAnswer(from, messageText);
    } catch (error) {
      console.error('Error handling SMS:', error);
      await this.sendErrorMessage(from);
    }
  }

  // Send current question to citizen
  async sendQuestion(phoneNumber, question, questionNumber, totalQuestions) {
    let message = `Q${questionNumber}/${totalQuestions}: ${question.text}\n\n`;

    // Add response options based on question type
    switch (question.type) {
      case 'meals_per_day':
        message += 'Reply:\n1. 0 meals\n2. 1 meal\n3. 2 meals\n4. 3+ meals';
        break;
      case 'days_of_food':
        message += 'Reply:\n1. 0 days\n2. 1 day\n3. 3 days\n4. 7+ days';
        break;
      case 'food_change':
        message += 'Reply:\n1. No change\n2. Reduced quantity\n3. Reduced quality\n4. Both reduced';
        break;
      case 'shocks':
        message += 'Reply numbers (e.g., 1,3):\n1. Income loss\n2. Drought\n3. Flood\n4. Illness\n5. Other';
        break;
      case 'yes_no':
        message += 'Reply: 1 for YES, 2 for NO';
        break;
      default:
        message += 'Reply with your answer';
    }

    message += '\n\nReply STOP to cancel, RESTART to restart';

    await this.smsProvider.sendSMS(phoneNumber, message);
  }

  // Process citizen's answer
  async processAnswer(phoneNumber, answerText) {
    const session = this.activeSessions.get(phoneNumber);
    const survey = await Survey.findByPk(session.surveyId, {
      include: [Question]
    });

    const currentQuestion = survey.Questions[session.currentQuestionIndex];
    const processedAnswer = this.parseAnswer(answerText, currentQuestion.type);

    if (processedAnswer === null) {
      await this.sendErrorMessage(phoneNumber, 'Invalid answer format. Please try again.');
      return;
    }

    // Store answer
    session.answers.push({
      questionId: currentQuestion.id,
      value: processedAnswer,
      timestamp: new Date()
    });

    // Move to next question or complete survey
    if (session.currentQuestionIndex < survey.Questions.length - 1) {
      session.currentQuestionIndex++;
      const nextQuestion = survey.Questions[session.currentQuestionIndex];
      await this.sendQuestion(phoneNumber, nextQuestion, session.currentQuestionIndex + 1, survey.Questions.length);
    } else {
      await this.completeSurvey(phoneNumber, session);
    }
  }

  // Parse answer based on question type
  parseAnswer(answerText, questionType) {
    const answer = answerText.trim();
    
    switch (questionType) {
      case 'meals_per_day':
        const mealsMap = { '1': '0', '2': '1', '3': '2', '4': '3', '0': '0' };
        return mealsMap[answer] || null;
        
      case 'days_of_food':
        const daysMap = { '1': '0', '2': '1', '3': '3', '4': '7' };
        return daysMap[answer] || null;
        
      case 'food_change':
        const changeMap = { '1': 'none', '2': 'quantity', '3': 'quality', '4': 'both' };
        return changeMap[answer] || null;
        
      case 'shocks':
        // Handle multiple selections like "1,3" or "1 3"
        const shockNumbers = answer.split(/[, ]/).filter(n => n.trim());
        const shockMap = { '1': 'income', '2': 'drought', '3': 'flood', '4': 'illness', '5': 'other' };
        return shockNumbers.map(n => shockMap[n.trim()]).filter(Boolean);
        
      case 'yes_no':
        return answer === '1' ? 'yes' : answer === '2' ? 'no' : null;
        
      default:
        return answer; // For text questions
    }
  }

  // Complete survey and save responses
  async completeSurvey(phoneNumber, session) {
    try {
      // Create response record
      const response = await Response.create({
        id: session.responseId,
        survey_id: session.surveyId,
        citizen_id: session.citizenId,
        channel: 'SMS',
        submitted_at: new Date()
      });

      // Calculate food security metrics from answers
      const foodSecurityData = this.extractFoodSecurityData(session.answers);
      const { food_security_score, risk_level } = this.calculateFoodSecurityMetrics(foodSecurityData);

      // Update response with calculated metrics
      await response.update({
        meals_per_day: foodSecurityData.meals_per_day,
        days_of_food_left: foodSecurityData.days_of_food_left,
        food_change_type: foodSecurityData.food_change_type,
        shocks_experienced: foodSecurityData.shocks_experienced,
        food_security_score,
        risk_level
      });

      // Save individual answers
      for (const answer of session.answers) {
        await Answer.create({
          response_id: response.id,
          question_id: answer.questionId,
          value: answer.value
        });
      }

      // Clean up session
      this.activeSessions.delete(phoneNumber);

      // Send completion message
      const completionMessage = `Thank you! Your food security report has been submitted.\n` +
        `Your risk level: ${risk_level.toUpperCase()}\n` +
        `Score: ${food_security_score}/100\n\n` +
        `Reply HELP for assistance, or wait for next survey.`;

      await this.smsProvider.sendSMS(phoneNumber, completionMessage);

      return { success: true, responseId: response.id };
    } catch (error) {
      throw new Error(`Failed to complete SMS survey: ${error.message}`);
    }
  }

  // Extract food security data from answers
  extractFoodSecurityData(answers) {
    const data = {
      meals_per_day: null,
      days_of_food_left: null,
      food_change_type: null,
      shocks_experienced: []
    };

    answers.forEach(answer => {
      if (typeof answer.value === 'number') {
        data.meals_per_day = answer.value;
      } else if (typeof answer.value === 'string') {
        if (['0', '1', '3', '7'].includes(answer.value)) {
          data.days_of_food_left = parseInt(answer.value);
        } else if (['none', 'quantity', 'quality', 'both'].includes(answer.value)) {
          data.food_change_type = answer.value;
        }
      } else if (Array.isArray(answer.value)) {
        data.shocks_experienced = answer.value;
      }
    });

    return data;
  }

  // Calculate food security metrics (same as foodReportController)
  calculateFoodSecurityMetrics(data) {
    let score = 100;
    let risk_level = 'low';

    if (data.meals_per_day === 0) score -= 40;
    else if (data.meals_per_day === 1) score -= 25;
    else if (data.meals_per_day === 2) score -= 10;

    if (data.days_of_food_left === 0) score -= 35;
    else if (data.days_of_food_left === 1) score -= 20;
    else if (data.days_of_food_left === 3) score -= 10;

    if (data.food_change_type === 'both') score -= 25;
    else if (data.food_change_type === 'quantity') score -= 15;
    else if (data.food_change_type === 'quality') score -= 10;

    const shockPenalty = (data.shocks_experienced || []).length * 5;
    score -= shockPenalty;

    score = Math.max(0, score);

    if (score >= 70) risk_level = 'low';
    else if (score >= 50) risk_level = 'medium';
    else if (score >= 30) risk_level = 'high';
    else risk_level = 'critical';

    return { food_security_score: score, risk_level };
  }

  // Send welcome message for unrecognized numbers
  async sendWelcomeMessage(phoneNumber) {
    const message = `Welcome to FeedGuard SMS Surveys!\n\n` +
      `Reply START to begin food security survey\n` +
      `Reply HELP for assistance\n` +
      `Reply STOP to unsubscribe`;
    
    await this.smsProvider.sendSMS(phoneNumber, message);
  }

  // Send error message
  async sendErrorMessage(phoneNumber, customMessage = null) {
    const message = customMessage || `Sorry, I didn't understand that. Please try again or reply HELP.`;
    await this.smsProvider.sendSMS(phoneNumber, message);
  }

  // Cancel ongoing survey
  async cancelSurvey(phoneNumber) {
    const session = this.activeSessions.get(phoneNumber);
    if (session) {
      this.activeSessions.delete(phoneNumber);
      await this.smsProvider.sendSMS(phoneNumber, 'Survey cancelled. Reply START to try again.');
    }
  }

  // Restart survey
  async restartSurvey(phoneNumber) {
    const session = this.activeSessions.get(phoneNumber);
    if (session) {
      session.currentQuestionIndex = 0;
      session.answers = [];
      
      const survey = await Survey.findByPk(session.surveyId, {
        include: [Question]
      });
      
      await this.sendQuestion(phoneNumber, survey.Questions[0], 1, survey.Questions.length);
    }
  }

  // Get active sessions count
  getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  // Bulk send survey invitations using Africa's Talking bulk SMS
  async sendSurveyInvitations(surveyId, regionIds = null) {
    try {
      const whereClause = { status: 'PUBLISHED' };
      if (regionIds) {
        whereClause.id = regionIds;
      }

      const survey = await Survey.findByPk(surveyId);
      if (!survey || survey.status !== 'PUBLISHED') {
        throw new Error('Survey not found or not published');
      }

      // Get citizens to survey
      const citizenWhere = {};
      if (regionIds) {
        citizenWhere.location_id = regionIds;
      }

      const citizens = await Citizen.findAll({ where: citizenWhere });
      
      if (citizens.length === 0) {
        return { success: true, invitationsSent: 0, message: 'No citizens found in specified regions' };
      }

      // Prepare invitation message
      const invitationMessage = `FeedGuard Food Security Survey\n\n` +
        `Reply START to begin the survey about your household's food situation.\n\n` +
        `This helps your community get assistance when needed.\n` +
        `Reply STOP to unsubscribe`;

      // Send bulk SMS using Africa's Talking optimized bulk service
      const phoneNumbers = citizens.map(citizen => citizen.phone_number);
      const bulkResult = await this.smsProvider.sendBulkSMS(phoneNumbers, invitationMessage);

      // Create individual sessions for citizens who respond
      const invitations = [];
      for (const citizen of citizens) {
        invitations.push({ 
          citizenId: citizen.id, 
          phoneNumber: citizen.phone_number,
          network: this.getMobileNetwork(citizen.phone_number)
        });
      }

      return { 
        success: true, 
        invitationsSent: invitations.length,
        bulkResult,
        message: `Successfully sent ${invitations.length} survey invitations via ${bulkResult.successfulDeliveries} successful deliveries`
      };
    } catch (error) {
      throw new Error(`Failed to send survey invitations: ${error.message}`);
    }
  }
}

module.exports = new SMSService();
