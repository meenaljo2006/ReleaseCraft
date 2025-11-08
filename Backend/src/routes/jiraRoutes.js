const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const { handleGetJiraTickets, handleGetMyTickets,handleGetMyProjects,handleJiraDisconnect,handleGetTicketsForProject} = require('../controllers/jiraController'); 

const { handleJiraAuthRedirect, handleJiraAuthCallback } = require('../controllers/jiraAuthController');

const router = express.Router();

// --- OAuth Routes ---

router.get('/auth/callback', handleJiraAuthCallback);
router.use(authMiddleware);
router.get('/auth/connect', handleJiraAuthRedirect);
// --- Test Admin Route ---
router.get('/tickets', handleGetJiraTickets); 
router.get('/me/projects/:projectKey/tickets', handleGetTicketsForProject);

// --- Real User Route ---
router.get('/me/tickets', handleGetMyTickets);
router.get('/me/projects', handleGetMyProjects);
router.post('/auth/disconnect', handleJiraDisconnect);

module.exports = router;