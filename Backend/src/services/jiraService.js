// src/services/jiraService.js
const axios = require('axios');
const User = require('../models/userModel'); // We need the User model

// Get your PERSONAL credentials from .env
const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN; // Your personal token

/**
 * Fetches "Done" tickets from your sandbox using your personal API token.
 */
const getJiraTickets = async (projectKey) => {
  if (!JIRA_DOMAIN || !JIRA_USER_EMAIL || !JIRA_API_TOKEN) {
    throw new Error("Your personal Jira credentials are not set in the .env file.");
  }

  // --- 1. Create the Authentication Header ---
  // This uses your personal token
  const authHeader = `Basic ${Buffer.from(
    `${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`
  ).toString('base64')}`;
  
  // --- 2. Define Your JQL Query ---
  const jql = `project = "${projectKey}" AND status = "Done" ORDER BY fixVersion DESC`;

  // --- 3. Make the API Call ---
  const jiraApiUrl = `${JIRA_DOMAIN}/rest/api/3/search`;

  try {
    const response = await axios.get(jiraApiUrl, {
      headers: { 
        'Authorization': authHeader, 
        'Accept': 'application/json' 
      },
      params: {
        jql: jql,
        fields: "summary,description,issuetype,status,fixVersions,labels"
      }
    });
    
    // --- 4. Return the Results ---
    return response.data.issues;

  } catch (error) {
    console.error("Error fetching Jira tickets:", error.response?.data || error.message);
    throw new Error("Failed to fetch data from Jira.");
  }
};

const getTicketsForUser = async (userId) => {
  // --- 1. Find the User and their Tokens ---
  const user = await User.findById(userId);
  if (!user || !user.jiraConnection || !user.jiraConnection.accessToken) {
    throw new Error('User not found or Jira not connected.');
  }

  const { accessToken, atlassianId } = user.jiraConnection;

  // --- 2. Check if Token is Expired (and refresh it) ---
  // We will build this part later! For now, we assume it's valid.

  // --- 3. Define the API URL and JQL ---
  // Note: The API URL is different! It uses the user's unique 'atlassianId'.
const jiraApiUrl = `https://api.atlassian.com/ex/jira/${atlassianId}/rest/api/3/search/jql`;
  const jql = `status = "Done" ORDER BY updated DESC`;

  // We now send our query in a POST request body
  const requestBody = {
    jql: jql,
    // Send 'fields' as an array of strings
    fields: [
      "summary",
      "description",
      "issuetype",
      "status",
      "fixVersions",
      "labels"
    ]
  };

  try {
    // --- 4. Make the API Call using POST instead of GET ---
    const response = await axios.post(jiraApiUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Use the user's OAuth token
        'Accept': 'application/json',
      }
    });

    return response.data.issues;

  } catch (error) {
    // If the token is expired, error.response.status will be 401
    if (error.response && error.response.status === 401) {
      // TODO: Call the 'refreshToken' service
      throw new Error('Jira access token is expired.');
    }
    console.error("Error fetching tickets for user:", error.response?.data || error.message);
    throw new Error('Failed to fetch tickets from Jira.');
  }
};

// Export both the old and new functions
module.exports = { 
  getJiraTickets,      // Your old admin test function
  getTicketsForUser    // Your new REAL function
};