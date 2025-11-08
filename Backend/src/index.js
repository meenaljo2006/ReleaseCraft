const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); //Route1
const jiraRoutes = require('./routes/jiraRoutes');
const releaseRoutes = require('./routes/releaseRoutes');

const app = express();
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

const corsOptions = {
  origin: 'http://localhost:5173' // This is the address of your frontend
};
app.use(cors(corsOptions));

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the .env file.");
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    
    app.listen(port, () => {
      console.log(`ReleaseCraft backend server is running at http://localhost:${port}`);
    });
    
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); 
  });

//Middleware - It allows your server to read JSON from request bodies
app.use(express.json()); 

//Route2 - Tell Express that any URL starting with "/api/users" should be handled by your "userRoutes" file.
app.use('/api/users', userRoutes); 
app.use('/api/jira',jiraRoutes);
app.use('/api/releases', authMiddleware,releaseRoutes);