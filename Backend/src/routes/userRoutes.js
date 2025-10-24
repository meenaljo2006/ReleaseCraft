const express = require('express');
const { handleUserSignup } = require('../controllers/userController');

const router = express.Router();

// When a POST request comes to /api/users/signup,it will be handled by the "handleUserSignup" controller.
router.post('/signup', handleUserSignup);

module.exports = router;