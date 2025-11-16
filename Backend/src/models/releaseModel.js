const mongoose = require('mongoose');
const { Schema } = mongoose;

const releaseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  
  projectKey: {
    type: String,
    required: true,
  },
  
  startDate: {
    type: Date,
    required: true,
  },
  
  endDate: {
    type: Date,
    required: true,
  },
  
  // This links the release to the user who created it
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This must match the name you used in userModel.js
    required: true
  },
  
  // This will eventually store the AI-generated notes
  content: {
    type: String,
    default: ''
  },
  
  status: {
    type: String,
    enum: ["draft", "pending", "processing", "published", "failed"],
    default: 'draft'
  }

}, { timestamps: true });

const Release = mongoose.model('Release', releaseSchema);

module.exports = Release;