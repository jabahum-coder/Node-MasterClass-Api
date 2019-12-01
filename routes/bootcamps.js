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

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const advancedResults = require('../middleware/advancedResult');
// Protect route function
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
	.route('/')
	.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
	.post(protect, authorize('publisher', 'admin'), createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(protect, authorize('publisher', 'admin'), updateBootcamp)
	.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

// Protected route add protect first,
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampUploadPhoto);

module.exports = router;
