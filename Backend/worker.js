// worker.js
require('dotenv').config(); // Load .env variables
const { Worker } = require('bullmq');
const { getTicketsForUser } = require('./src/services/jiraService');
const { summarizeTicket } = require('./src/services/aiService');
const Release = require('./src/models/releaseModel');
const mongoose = require('mongoose');

const redisUrl = process.env.REDIS_URL;

console.log('Worker is starting...');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Worker connected to MongoDB.'))
  .catch(err => console.error('Worker MongoDB connection error:', err));

// This is the function that will process each job
const jobProcessor = async (job) => {
  const { releaseId, userId, projectKey, filters } = job.data;
  console.log(`WORKER: Processing job for release: ${releaseId}`);

  try {
    const release = await Release.findById(releaseId);
    if (!release) throw new Error('Release not found');

    let tickets = [];

    // --- NAYA LOGIC ---
    if (filters) {
      console.log('WORKER: Fetching tickets from Jira using filters...');
      tickets = await getTicketsForUser(
        userId,
        projectKey,
        filters.status,
        filters.startDate,
        filters.endDate
      );
    } else {
      // Puraana logic (agar zaroorat pade)
      console.log('WORKER: No filters found, using release dates.');
      tickets = await getTicketsForUser(
        userId,
        release.projectKey,
        "Done", // Default
        release.startDate,
        release.endDate
      );
    }
    // --- NAYA LOGIC KHATAM ---

    console.log(`WORKER: Summarizing ${tickets.length} tickets.`);
    
    let finalNotes = `## ${release.title}\n\n`;
    for (const ticket of tickets) {
      // Ab 'fields' use karna hai kyunki tickets Jira se aa rahe hain
      const technicalSummary = ticket.fields.summary;
      const technicalDescription = ticket.fields.description;
      
      const humanSummary = await summarizeTicket(technicalSummary, technicalDescription);
      finalNotes += `- ${humanSummary}\n`;
    }

    release.content = finalNotes;
    await release.save();

    console.log(`WORKER: Job completed for release: ${releaseId}`);
    return 'Done';
  } catch (error) {
    console.error(`WORKER: Job failed for release ${releaseId}:`, error.message);
    throw error; // This will mark the job as 'failed' in BullMQ
  }
};

// Start the worker
const worker = new Worker('release-generation', jobProcessor, {
  connection: {
    url: redisUrl
  }
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});