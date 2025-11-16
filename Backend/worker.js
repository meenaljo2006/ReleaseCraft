require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');

const { getTicketsForUser } = require('./src/services/jiraService');
const { batchSummarizeTickets } = require('./src/services/aiService');
const Release = require('./src/models/releaseModel');

const redisUrl = process.env.REDIS_URL;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Worker connected to MongoDB"))
  .catch((err) => console.error("🔴 Mongo error:", err));

const jobProcessor = async (job) => {
  const { releaseId, userId, projectKey, filters } = job.data;

  console.log(`\n🚀 Processing Release Job ${releaseId}`);

  try {
    const release = await Release.findById(releaseId);
    if (!release) throw new Error("Release not found");

    release.status = "processing";
    await release.save();

    // Fetch tickets
    const tickets = await getTicketsForUser(
      userId,
      projectKey,
      filters.status,
      filters.startDate,
      filters.endDate
    );

    console.log(`📦 Tickets fetched: ${tickets.length}`);

    if (tickets.length === 0) {
      release.status = "published";
      release.content = `## ${release.title}\n\nNo 'Done' tickets found.`;
      await release.save();
      return "No tickets";
    }

    // BATCH AI CALL 🚀
    console.log("🧠 Running batch AI summarization...");
    const summaries = await batchSummarizeTickets(tickets);

    // Build final notes
    let content = `## ${release.title}\n\n`;
    summaries.forEach((s) => {
      content += `- ${s}\n`;
    });

    // Save final content
    release.status = "published";
    release.content = content;
    await release.save();

    console.log(`✅ Release ${releaseId} Completed`);
    return "Done";

  } catch (err) {
    console.error("❌ Worker Job Failed:", err.message);

    const failed = await Release.findById(job.data.releaseId);
    if (failed) {
      failed.status = "failed";
      failed.content = `ERROR: ${err.message}`;
      await failed.save();
    }

    throw err;
  }
};

new Worker("release-generation", jobProcessor, {
  connection: { url: redisUrl },
}).on("failed", (job, err) =>
  console.error(`❌ Job ${job.id} failed: ${err.message}`)
);
