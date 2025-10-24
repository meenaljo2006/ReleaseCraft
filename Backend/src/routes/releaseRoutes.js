const express = require('express');
const { createRelease, getReleases } = require('../controllers/releaseController');

const router = express.Router();

//to create a new one - releases
router.post('/', createRelease);

//to get all the releases
router.get('/', getReleases);

module.exports = router;