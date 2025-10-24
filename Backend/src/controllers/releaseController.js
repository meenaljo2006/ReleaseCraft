const Release = require('../models/releaseModel');
const { getTicketsForUser } = require('../services/jiraService');

//Create Releases
const createRelease = async (req, res) => {
  try {
    const { title, projectKey, startDate, endDate } = req.body;

    const tempUserId = "68fb5481da4dc85cbe1f7d53"; 
    
    if (!title || !projectKey || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newRelease = new Release({
      title,
      projectKey,
      startDate,
      endDate,
      user: tempUserId
    });
    
    await newRelease.save();
    res.status(201).json(newRelease);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get all releases for a user
const getReleases = async (req, res) => {
  try {
    const tempUserId = "68fb5481da4dc85cbe1f7d53"; 
    
    const releases = await Release.find({ user: tempUserId }).sort({ createdAt: -1 });
    res.status(200).json(releases);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Generate Releases
const generateReleaseNotes = async (req, res) => {
  try {
    const { id: releaseId } = req.params; 
    
    const tempUserId = "68fb5481da4dc85cbe1f7d53"; 

    // 1. Find the release draft in our database
    const release = await Release.findOne({ _id: releaseId, user: tempUserId });
    console.log("Found release object:", release);
    
    if (!release) {
      return res.status(404).json({ message: 'Release not found' });
    }

    // 2. Call our newly-upgraded Jira service with the release's dates
    const tickets = await getTicketsForUser(
      tempUserId, 
      release.projectKey,
      release.startDate, 
      release.endDate
    );

    // 3.Save the raw tickets to the release draft - just save the summaries for now as a simple string
    release.content = tickets.map(t => t.fields.summary).join('\n');
    await release.save();

    // 4. Return the fetched tickets
    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRelease,
  getReleases,
  generateReleaseNotes 
};