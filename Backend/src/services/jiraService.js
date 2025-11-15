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

const getTicketsForUser = async (userId, projectKey,status,startDate, endDate) => {
  const user = await User.findById(userId);
  if (!user || !user.jiraConnection || !user.jiraConnection.accessToken) {
    throw new Error('User not found or Jira not connected.');
  }

  let { accessToken, atlassianId } = user.jiraConnection;

  const jiraApiUrl = `https://api.atlassian.com/ex/jira/${atlassianId}/rest/api/3/search/jql`;

  const start = new Date(startDate).toISOString().split('T')[0];
  const end = new Date(endDate).toISOString().split('T')[0];
  
 // ...
  let jql = `project = "${projectKey}" AND updated >= "${start}" AND updated <= "${end}"`;
  
  if (status) {
    jql += ` AND status = "${status}"`;
  }
  // --- YEH NAYI, SAFER JQL HAI ---
  jql += " ORDER BY status ASC, updated DESC"; // 'priority' ko hata diya
  // ...

  const requestBody = {
    jql: jql,
    fields: ["summary", "description", "issuetype", "status","priority","created",  "updated",  "assignee"]
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

const getProjectStats = async (userId, projectKey, atlassianId, accessToken) => {
  const jiraApiUrl = `https://api.atlassian.com/ex/jira/${atlassianId}/rest/api/3/search/jql`;
  const jql = `project = "${projectKey}"`;
  const requestBody = { jql: jql, fields: ["status"], maxResults: 1000 };

  try {
    const response = await axios.post(jiraApiUrl, requestBody, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log(`[DEBUG] Stats for ${projectKey}: Fetched ${response.data.issues.length} tickets.`);

    const stats = { todo: 0, inProgress: 0, done: 0 };
    for (const ticket of response.data.issues) {
      const category = ticket.fields.status.statusCategory.name;

      // --- YEH HAI SAHI CHECK ---
      if (category === 'To Do') stats.todo++;
      else if (category === 'In Progress') stats.inProgress++;
      else if (category === 'Done') stats.done++;
    }
    
    console.log(`[DEBUG] Final stats for ${projectKey}:`, stats);
    return stats;

  } catch (error) {
    console.error(`Failed to get stats for ${projectKey}:`, error.message);
    return { todo: 0, inProgress: 0, done: 0 };
  }
};

const getProjectsForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.jiraConnection || !user.jiraConnection.accessToken) {
    throw new Error('User not found or Jira not connected.');
  }

  let { accessToken, atlassianId } = user.jiraConnection;
  const jiraApiUrl = `https://api.atlassian.com/ex/jira/${atlassianId}/rest/api/3/project/search`;

  try {
    
    const response = await axios.get(jiraApiUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const projects = response.data.values.map(project => ({
      id: project.id,
      key: project.key,
      name: project.name,
      avatarUrl: project.avatarUrls['48x48']
    }));

    const statsPromises = projects.map(project => 
      getProjectStats(userId, project.key, atlassianId, accessToken)
    );
    
    // Saare API calls ke poora hone ka wait karein
    const allStats = await Promise.all(statsPromises);

    // 4. Stats ko projects ke saath jod dein
    projects.forEach((project, index) => {
      project.stats = allStats[index]; // { todo: 5, inProgress: 10, ... }
    });
    
    return projects;

  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Access token expired. Attempting to refresh...');
      try {
        const newAccessToken = await refreshJiraToken(userId);
        console.log('Retrying API call with new token...');
        
        const retryResponse = await axios.get(jiraApiUrl, {
          headers: { 'Authorization': `Bearer ${newAccessToken}` }
        });

        const projects = retryResponse.data.values.map(project => ({
          id: project.id,
          key: project.key,
          name: project.name,
          avatarUrl: project.avatarUrls['48x48']
        }));

        const statsPromises = projects.map(project => 
          getProjectStats(userId, project.key, atlassianId, newAccessToken) // Naya token use karein
        );
        const allStats = await Promise.all(statsPromises);
        
        projects.forEach((project, index) => {
          project.stats = allStats[index];
        });

        return projects;
        
      } catch (refreshError) {
        throw refreshError;
      }
    }
    console.error("Error fetching projects for user:", error.response?.data || error.message);
    throw new Error('Failed to fetch projects from Jira.');
  }
};

module.exports = {
  getJiraTickets,
  getTicketsForUser,
  getProjectsForUser ,
  getProjectStats
};