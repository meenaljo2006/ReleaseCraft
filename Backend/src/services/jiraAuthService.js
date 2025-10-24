const axios = require('axios');
const User = require('../models/userModel');

const CLIENT_ID = process.env.JIRA_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.JIRA_OAUTH_CLIENT_SECRET;
const CALLBACK_URL = 'http://localhost:3001/api/jira/auth/callback';

//Service for Route 1: Generates the URL to send the user to.
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

//Service for Route 2: Handles the callback from Jira.
const processJiraCallback = async (code, userId) => {
  try {
    const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: CALLBACK_URL,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    const cloudIdResponse = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    const atlassianId = cloudIdResponse.data[0].id; 
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    user.jiraConnection = {
      atlassianId: atlassianId,
      accessToken: access_token, 
      refreshToken: refresh_token, 
      expiresAt: new Date(Date.now() + expires_in * 1000)
    };

    await user.save();
    console.log('Successfully saved Jira tokens for user:', user.email);

  } catch (error) {
    console.error('Error in processJiraCallback:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for token.');
  }
};

const refreshJiraToken = async (userId) => {
  console.log(`Refreshing token for user: ${userId}`);
  
  const user = await User.findById(userId);
  if (!user || !user.jiraConnection || !user.jiraConnection.refreshToken) {
    throw new Error('User has no refresh token to use.');
  }

  const { refreshToken } = user.jiraConnection;

  try {
    const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: newRefreshToken, expires_in } = tokenResponse.data;

    user.jiraConnection.accessToken = access_token;
    user.jiraConnection.refreshToken = newRefreshToken;
    user.jiraConnection.expiresAt = new Date(Date.now() + expires_in * 1000);

    await user.save();
    console.log('Successfully refreshed and saved new tokens.');

    return access_token;

  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    user.jiraConnection = undefined;
    await user.save();
    throw new Error('Failed to refresh token. User must re-authenticate.');
  }
};

module.exports = {
  getJiraAuthUrl,
  processJiraCallback,
  refreshJiraToken, 
};