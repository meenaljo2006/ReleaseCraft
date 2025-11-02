// src/queues/generationQueue.js
const { Queue } = require('bullmq');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("REDIS_URL not set. Queue will not connect.");
}

// Create the queue
const generationQueue = new Queue('release-generation', {
  connection: {
    url: redisUrl
  }
});

module.exports = generationQueue;