// This file for logging in with OAuth
const jiraAuthService = require('../services/jiraAuthService'); // We will create this

// Controller for Route 1: /auth/connect
const handleJiraAuthRedirect = (req, res) => {

  const userId = req.user._id;
  
  const authUrl = jiraAuthService.getJiraAuthUrl(userId);
  // res.redirect(authUrl);
  res.status(200).json({ url: authUrl });
};

// Controller for Route 2: /auth/callback
const handleJiraAuthCallback = async (req, res) => {
  const { code,state } = req.query;
  const userId = state;
  if (!code) {
    return res.status(400).send('Jira did not provide a code.');
  }
  if (!userId) {
    return res.status(400).send('No user ID was found in the state.');
  }

  try {
    // const tempUserId = "68fb5481da4dc85cbe1f7d53"; 
    // const realUserId = req.user._id;
    await jiraAuthService.processJiraCallback(code, userId);
    res.redirect('http://localhost:5173/dashboard');

  } catch (error) {
    res.status(500).send(`Error connecting Jira account: ${error.message}`);
  }
};

module.exports = {
  handleJiraAuthRedirect,
  handleJiraAuthCallback
};