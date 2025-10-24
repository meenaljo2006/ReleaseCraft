// This File for fetching tickets
const { getJiraTickets, getTicketsForUser, getProjectsForUser } = require('../services/jiraService'); 

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
  try {
    const tickets = await getTicketsForUser(
      tempUserId,
      fakeProjectKey,
      fakeStartDate,
      fakeEndDate
    );

    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleGetMyProjects = async (req, res) => {
  try {
    const tempUserId = "68fb5481da4dc85cbe1f7d53"; 

    const projects = await getProjectsForUser(tempUserId);
    res.status(200).json(projects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleGetJiraTickets,
  handleGetMyTickets,
  handleGetMyProjects 
};