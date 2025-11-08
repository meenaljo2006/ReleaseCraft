// src/middleware/authMiddleware.js
const admin = require('firebase-admin');
const User = require('../models/userModel');

// Initialize Firebase Admin
const serviceAccount = require('../../firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // 2. Find *our* user in MongoDB using the Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found in our database' });
    }

    // 3. Attach our full user object to the request
    req.user = user;
    next(); // Move to the next step (the controller)

  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
  }
};

module.exports = authMiddleware;