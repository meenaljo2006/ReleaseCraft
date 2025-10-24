// src/routes/jiraRoutes.js
const express = require('express');

const { 
  handleGetJiraTickets, 
  handleGetMyTickets // <-- Import the new one
} = require('../controllers/jiraController'); 

const { 
  handleJiraAuthRedirect, 
  handleJiraAuthCallback 
} = require('../controllers/jiraAuthController');

const router = express.Router();

// --- Test Admin Route ---
router.get('/tickets', handleGetJiraTickets); 

// --- Real User Route ---
router.get('/me/tickets', handleGetMyTickets); // <-- ADD THIS NEW ROUTE

// --- OAuth Routes ---
router.get('/auth/connect', handleJiraAuthRedirect);
router.get('/auth/callback', handleJiraAuthCallback);

module.exports = router;