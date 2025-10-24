const express = require('express');
const { createRelease, getReleases,generateReleaseNotes } = require('../controllers/releaseController');

const router = express.Router();

//to create a new one - releases
router.post('/', createRelease);

//to get all the releases
router.get('/', getReleases);

// For a specific release (by :id) run the 'generate' action
router.post('/:id/generate', generateReleaseNotes);

module.exports = router;