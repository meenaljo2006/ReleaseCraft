// This file for logging in with OAuth
const jiraAuthService = require('../services/jiraAuthService'); // We will create this

// Controller for Route 1: /auth/connect
const handleJiraAuthRedirect = (req, res) => {
  // This function just calls the service to get the magic URL
  const authUrl = jiraAuthService.getJiraAuthUrl();
  // It then redirects the user's browser to that URL
  res.redirect(authUrl);
};

// Controller for Route 2: /auth/callback
const handleJiraAuthCallback = async (req, res) => {
  // Get the 'code' from Jira's query parameters
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Jira did not provide a code.');
  }

  try {
    // --- THIS IS A TEMPORARY HACK ---
    // Normally, you'd get the user ID from your login (Firebase)
    // For now, we'll find the *first* user in our database and
    // add the Jira connection to them.
    const tempUserId = "68fb5481da4dc85cbe1f7d53"; // Go to MongoDB, copy a user's _id and paste it here
    
    // Call the service to swap the code for tokens and save them
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