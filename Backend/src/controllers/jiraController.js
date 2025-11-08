// This File for fetching tickets
const User = require('../models/userModel');
const { getJiraTickets, getTicketsForUser, getProjectsForUser } = require('../services/jiraService'); 

// --- 1. YEH NAYA FUNCTION ADD KAREIN ---
const handleJiraDisconnect = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Bas user ki connection info ko clear kar dein
    user.jiraConnection = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Jira account disconnected successfully.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleGetTicketsForProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const { projectKey} = req.params; // URL se key milegi

    if (!projectKey || !startDate || !endDate) {
      return res.status(400).json({ message: "projectKey is required"});
    }

    // 'getTicketsForUser' ko call karein, par bahut badi date range ke saath
    // taaki saare tickets aa jaayein.
// ...
    const tickets = await getTicketsForUser(
      userId,
      projectKey,
      status,         // <-- FIX: status ko null (ya "") bhej dein
      '1990-01-01', 
      '2099-12-31'
    );
// ...

    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleGetJiraTickets = async (req, res) => {
  try {
    const YOUR_PROJECT_KEY = "REL"; 
    console.log("Controller: Request received for /api/jira/tickets");

    const tickets = await getJiraTickets(YOUR_PROJECT_KEY);
    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({ message: "Error in jiraController", error: error.message });
  }
};

const handleGetMyTickets = async (req, res) => {
  const realUserId = req.user._id;
  const { projectKey, status,startDate, endDate } = req.query; // Or req.body
  try {
    const tickets = await getTicketsForUser(
      realUserId,
      projectKey,
      status,
      startDate,
      endDate
    );

    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleGetMyProjects = async (req, res) => {
  try {
    // const tempUserId = "68fb5481da4dc85cbe1f7d53"; 

    const realUserId = req.user._id;
    const projects = await getProjectsForUser(realUserId);
    res.status(200).json(projects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleGetJiraTickets,
  handleGetMyTickets,
  handleGetMyProjects,
  handleJiraDisconnect ,
  handleGetTicketsForProject
};