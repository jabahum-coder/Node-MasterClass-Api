const express = require('express');
const router = express.Router();
const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
	bootcampUploadPhoto
} = require('../controllers/bootcamps');
const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advancedResult');

// Include other resource routers
const courseRouter = require('./courses');

// Protect route function
const { protect } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, createBootcamp);

router.route('/:id').get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp);

// Protected route add protect first,
router.route('/:id/photo').put(protect, bootcampUploadPhoto);

module.exports = router;
