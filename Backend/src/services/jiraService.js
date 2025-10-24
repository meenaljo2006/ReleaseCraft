const axios = require('axios');
const User = require('../models/userModel'); 
const { refreshJiraToken } = require('./jiraAuthService');

const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN; 

const getJiraTickets = async (projectKey) => {
  if (!JIRA_DOMAIN || !JIRA_USER_EMAIL || !JIRA_API_TOKEN) {
    throw new Error("Your personal Jira credentials are not set in the .env file.");
  }
 
  const authHeader = `Basic ${Buffer.from(
    `${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`
  ).toString('base64')}`;
  
  const jql = `project = "${projectKey}" AND status = "Done" ORDER BY fixVersion DESC`;

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
    
    return response.data.issues;

  } catch (error) {
    console.error("Error fetching Jira tickets:", error.response?.data || error.message);
    throw new Error("Failed to fetch data from Jira.");
  }
};

const getTicketsForUser = async (userId, startDate, endDate) => {
  const user = await User.findById(userId);
  if (!user || !user.jiraConnection || !user.jiraConnection.accessToken) {
    throw new Error('User not found or Jira not connected.');
  }

  let { accessToken, atlassianId } = user.jiraConnection;

  const jiraApiUrl = `https://api.atlassian.com/ex/jira/${atlassianId}/rest/api/3/search/jql`;

  const start = new Date(startDate).toISOString().split('T')[0];
  const end = new Date(endDate).toISOString().split('T')[0];
  
  const jql = `
    project = "${projectKey}"
    status = "Done" 
    AND resolutiondate >= "${start}" 
    AND resolutiondate <= "${end}"
    ORDER BY updated DESC
  `;

  const requestBody = {
    jql: jql,
    fields: ["summary", "description", "issuetype", "status", "fixVersions", "labels"]
  };

  try {
    const response = await axios.post(jiraApiUrl, requestBody, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data.issues;

  } catch (error) {

    if (error.response && error.response.status === 401) {
      console.log('Access token expired. Attempting to refresh...');

      try {
        const newAccessToken = await refreshJiraToken(userId);
        console.log('Retrying API call with new token...');
        const retryResponse = await axios.post(jiraApiUrl, requestBody, {
          headers: { 'Authorization': `Bearer ${newAccessToken}` }
        });
        return retryResponse.data.issues;
      } catch (refreshError) {
        throw refreshError;
      }

    }
    console.error("Error fetching tickets for user:", error.response?.data || error.message);
    throw new Error('Failed to fetch tickets from Jira.');
  }
};

module.exports = {
  getJiraTickets,
  getTicketsForUser
};