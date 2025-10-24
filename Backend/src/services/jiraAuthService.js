// src/services/jiraAuthService.js
const axios = require('axios');
const User = require('../models/userModel');

const CLIENT_ID = process.env.JIRA_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.JIRA_OAUTH_CLIENT_SECRET;
// This MUST match what you put in the Atlassian developer console
const CALLBACK_URL = 'http://localhost:3001/api/jira/auth/callback';

/**
 * Service for Route 1: Generates the URL to send the user to.
 */
const getJiraAuthUrl = () => {
  const authUrl = new URL('https://auth.atlassian.com/authorize');
  authUrl.searchParams.append('audience', 'api.atlassian.com');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('scope', 'read:jira-work offline_access'); // 'offline_access' is key for refresh token
  authUrl.searchParams.append('redirect_uri', CALLBACK_URL);
  authUrl.searchParams.append('state', 'some-random-state-for-security'); // For CSRF protection
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('prompt', 'consent');
  
  return authUrl.toString();
};

/**
 * Service for Route 2: Handles the callback from Jira.
 */
const processJiraCallback = async (code, userId) => {
  try {
    // --- 1. Swap the 'code' for an Access Token ---
    const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: CALLBACK_URL,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // --- 2. Get the 'atlassianId' (cloudId) ---
    // We need this to make API calls later.
    const cloudIdResponse = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    // We'll just use the first "site" or "cloud" the user has
    const atlassianId = cloudIdResponse.data[0].id; 
    
    // --- 3. Save the tokens to our User in MongoDB ---
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    user.jiraConnection = {
      atlassianId: atlassianId,
      accessToken: access_token, // You should encrypt this!
      refreshToken: refresh_token, // You should encrypt this!
      expiresAt: new Date(Date.now() + expires_in * 1000)
    };

    await user.save();
    console.log('Successfully saved Jira tokens for user:', user.email);

  } catch (error) {
    console.error('Error in processJiraCallback:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for token.');
  }
};

module.exports = {
  getJiraAuthUrl,
  processJiraCallback
};