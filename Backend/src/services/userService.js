const User = require('../models/userModel'); 

// Creates a new user in the database
const createUser = async (userData) => {
  const { email, name, firebaseUid } = userData;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new Error('User already exists with that email');
    }

    // Create the new user
    const newUser = new User({
      email,
      name,
      firebaseUid,
    });

    // Save to the database
    await newUser.save();
    return newUser;

  } catch (error) {
    throw error; // Pass the error up to the controller
  }
};

module.exports = { createUser };