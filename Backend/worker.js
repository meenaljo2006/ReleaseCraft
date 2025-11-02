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
  const { releaseId, userId } = job.data;
  console.log(`WORKER: Processing job for release: ${releaseId}`);

  try {
    // 1. Find the release
    const release = await Release.findById(releaseId);
    if (!release) throw new Error('Release not found');

    // 2. Fetch tickets from Jira
    const tickets = await getTicketsForUser(
      userId,
      release.projectKey,
      release.startDate,
      release.endDate
    );
    console.log(`WORKER: Fetched ${tickets.length} tickets.`);

    // 3. Summarize with AI (The slow part)
    let finalNotes = `## ${release.title}\n\n`;
    for (const ticket of tickets) {
      const technicalSummary = ticket.fields.summary;
      const technicalDescription = ticket.fields.description;
      const humanSummary = await summarizeTicket(technicalSummary, technicalDescription);
      finalNotes += `- ${humanSummary}\n`;
      await job.updateProgress(tickets.indexOf(ticket) / tickets.length * 100); // Optional: updates progress
    }

    // 4. Save the final notes to the database
    release.content = finalNotes;
    release.status = 'draft'; // Or 'completed'
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