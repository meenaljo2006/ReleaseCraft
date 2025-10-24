// This file for logging in with OAuth
const jiraAuthService = require('../services/jiraAuthService'); // We will create this

// Controller for Route 1: /auth/connect
const handleJiraAuthRedirect = (req, res) => {
  
  const authUrl = jiraAuthService.getJiraAuthUrl();
  res.redirect(authUrl);
};

// Controller for Route 2: /auth/callback
const handleJiraAuthCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Jira did not provide a code.');
  }

  try {
    const tempUserId = "68fb5481da4dc85cbe1f7d53"; 
    await jiraAuthService.processJiraCallback(code, tempUserId);
    res.send('Success! Your Jira account is connected. You can close this tab.');

  } catch (error) {
    res.status(500).send(`Error connecting Jira account: ${error.message}`);
  }
};

module.exports = {
  handleJiraAuthRedirect,
  handleJiraAuthCallback
};