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
// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampUploadPhoto);

module.exports = router;
