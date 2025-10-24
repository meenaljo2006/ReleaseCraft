const mongoose = require('mongoose');

// blueprint for a User in your database
const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true, // Every user must have an email
    unique: true,   // No two users can have the same email
    lowercase: true // Store emails in lowercase
  },
  
  // This will store the unique ID we get from Firebase Authentication
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  
  name: {
    type: String
  },
  
  // This will eventually store the user's encrypted Jira/GitHub tokens, empty for now.
  connections: {
    type: Object,
    default: {}
  },

  jiraConnection: {
    atlassianId: { type: String }, // Jira's unique ID for the user's site
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date }
  }
  
}, {
  // This adds "createdAt" and "updatedAt" timestamps automatically
  timestamps: true 
});

// This creates the actual "User" collection (table) in your MongoDB based on the schema blueprint.
const User = mongoose.model('User', userSchema);

module.exports = User;