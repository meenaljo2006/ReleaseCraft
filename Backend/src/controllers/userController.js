const userService = require('../services/userService');

//Handles the HTTP request for user signup.
const handleUserSignup = async (req, res) => {
  try {
    // Get the data from the request body (this will come from your frontend)
    const { email, name, firebaseUid } = req.body; 

    if (!email || !firebaseUid) {
      return res.status(400).json({ message: 'Email and Firebase UID are required' });
    }

    // Call the service to create the user
    const newUser = await userService.createUser({ email, name, firebaseUid }); 
    res.status(201).json(newUser);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { handleUserSignup };