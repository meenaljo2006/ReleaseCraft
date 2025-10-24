// This File for fetching tickets
const { getJiraTickets, getTicketsForUser } = require('../services/jiraService'); // You already have this service

/**
 * Handles the HTTP request for getting tickets
 * This is your ORIGINAL test controller.
 */
const handleGetJiraTickets = async (req, res) => {
  try {
    // ⚠️ IMPORTANT: Change this to your actual project key
    const YOUR_PROJECT_KEY = "REL"; 
    
    console.log("Controller: Request received for /api/jira/tickets");
    
    // Call the service (this is your *old* service)
    const tickets = await getJiraTickets(YOUR_PROJECT_KEY);
    
    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({ message: "Error in jiraController", error: error.message });
  }
};

const handleGetMyTickets = async (req, res) => {
  try {
    // --- THIS IS A TEMPORARY HACK ---
    // Normally, you'd get the user ID from your login (Firebase)
    // For now, we'll use the same test user ID from the OAuth flow
    const tempUserId = "68fb5481da4dc85cbe1f7d53"; // Paste your test user's _id here

    const tickets = await getTicketsForUser(tempUserId);

    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  handleGetJiraTickets, // The old one
  handleGetMyTickets    // The new one
};