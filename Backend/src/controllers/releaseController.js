const Release = require('../models/releaseModel');

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

module.exports = { createRelease, getReleases };