// This File for fetching tickets
const { getJiraTickets, getTicketsForUser } = require('../services/jiraService'); // You already have this service

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

module.exports = { 
  handleGetJiraTickets, 
  handleGetMyTickets    
};