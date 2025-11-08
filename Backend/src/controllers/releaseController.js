const Release = require('../models/releaseModel');
const generationQueue = require('../queues/generationQueue');
// const { getTicketsForUser } = require('../services/jiraService');
// const { summarizeTicket } = require('../services/aiService');

//Create Releases
const createRelease = async (req, res) => {
  try {
    const { title, projectKey, startDate, endDate } = req.body;

    // const tempUserId = "68fb5481da4dc85cbe1f7d53"; 
    const realUserId = req.user._id;
    
    if (!title || !projectKey || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newRelease = new Release({
      title,
      projectKey,
      startDate,
      endDate,
      user: realUserId
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
    // const tempUserId = "68fb5481da4dc85cbe1f7d53"; 
    const realUserId = req.user._id;
    
    const releases = await Release.find({ user: realUserId }).sort({ createdAt: -1 });
    res.status(200).json(releases);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Generate Releases
// const generateReleaseNotes = async (req, res) => {
//   try {
//     const { id: releaseId } = req.params; 
//     const tempUserId = "68fb5481da4dc85cbe1f7d53"; 

//     const release = await Release.findOne({ _id: releaseId, user: tempUserId });
//     if (!release) {
//       return res.status(404).json({ message: 'Release not found' });
//     }

//     // --- 1. FETCH TICKETS (Phase 1) ---
//     console.log("Fetching tickets from Jira...");
//     const tickets = await getTicketsForUser(
//       tempUserId, 
//       release.projectKey, 
//       release.startDate, 
//       release.endDate
//     );
//     console.log(`Fetched ${tickets.length} tickets.`);

//     // --- 2. SUMMARIZE WITH AI (Phase 2) ---
//     // This part is slow! We are calling the AI for *every* ticket.
//     console.log("Summarizing tickets with AI... (this may be slow)");
    
//     const summarizedNotes = [];
//     for (const ticket of tickets) {
//       const technicalSummary = ticket.fields.summary;
//       const technicalDescription = ticket.fields.description; // Get description too
      
//       const humanSummary = await summarizeTicket(technicalSummary, technicalDescription);
      
//       summarizedNotes.push({
//         original: technicalSummary,
//         human: humanSummary
//       });
//     }

//     // 3. Save the result to the release
//     release.content = summarizedNotes.map(note => `- ${note.human}`).join('\n');
//     await release.save();

//     // 4. Return the new human-readable summaries
//     console.log("Done summarizing!");
//     res.status(200).json(summarizedNotes);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const generateReleaseNotes = async (req, res) => {
  try {
    const { id: releaseId } = req.params;
    // const tempUserId = "68fb5481da4dc85cbe1f7d53"; // Your test user ID
    const realUserId = req.user._id;

    // 1. Find the release
    const release = await Release.findOne({ _id: releaseId, user: realUserId });
    if (!release) {
      return res.status(404).json({ message: 'Release not found' });
    }

    // 2. Add the job to the queue
    // This is the *only* thing the controller does now
    await generationQueue.add('generate-notes-job', {
      releaseId: releaseId,
      userId: realUserId
    });

    // 3. Respond INSTANTLY
    res.status(202).json({ 
      message: 'Accepted: Release generation has started in the background.' 
    });

  } catch (error){
    res.status(500).json({ message: error.message });
  }
};

// src/controllers/releaseController.js
// ...
// --- YEH NAYA FUNCTION ADD KAREIN ---
const handleGenerateFromFilters = async (req, res) => {
  try {
    const { title, projectKey, filters } = req.body;
    const realUserId = req.user._id;

    if (!title || !projectKey || !filters) {
      return res.status(400).json({ message: 'Title, projectKey, and filters are required.' });
    }

    // 1. Naya release draft banayein
    const newRelease = new Release({
      title: title,
      projectKey: projectKey,
      user: realUserId,
      status: 'draft',
      // Filters ko save kar lein, taaki worker use kar sake
      startDate: filters.startDate,
      endDate: filters.endDate
      // Aap custom fields bhi save kar sakte hain
    });
    await newRelease.save();

    // 2. Job ko queue karein
    // **IMPORTANT**: Hum worker ko filters bhejenge
    await generationQueue.add('generate-notes-job', {
      releaseId: newRelease._id,
      userId: realUserId,
      projectKey: projectKey,
      filters: filters // Poora filter object
    });

    res.status(202).json({ 
      message: 'Accepted: Release generation has started.',
      releaseId: newRelease._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRelease,
  getReleases,
  generateReleaseNotes ,
  handleGenerateFromFilters
};