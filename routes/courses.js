const { getCourses } = require('../controllers/courses');

const express = require('express');
// Merge re-routed routes
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses);

module.exports = router;
