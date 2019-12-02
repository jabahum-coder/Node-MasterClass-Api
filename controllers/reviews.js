const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Reviews = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');

// @desc 	GET reviews
// @route 	GET /api/v1/reviews/
// @access	 Public
exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Reviews.find({ bootcamp: req.params.bootcampId });

		res.status(200).json({ success: true, count: reviews.length, data: reviews });
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @desc 	GET a single review
// @route 	GET /api/v1/reviews/:id
// @access	 Public
exports.getReviewById = asyncHandler(async (req, res, next) => {
	const reviewId = req.params.id;
	const review = await Reviews.findById(reviewId).populate({
		path: 'bootcamp',
		select: 'name description'
	});

	if (!review) {
		return next(new ErrorResponse(`No review found with the id of ${reviewId}`), 404);
	}

	res.status(200).json({
		success: true,
		data: review
	});
});

// @desc 	POST review
// @route 	POST /api/v1/bootcamps/:bootcampId/reviews
// @access	 Private
exports.createReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(new ErrorRespnose(`No matching bootcamp with the id of ${bootcampId}`), 404);
	}

	const review = await Reviews.create(req.body);

	res.status(201).json({ succes: true, data: review });
});

// @desc 	Update review
// @route 	PUT /api/v1/reviews/:id
// @access	 Private
exports.updateReview = asyncHandler(async (req, res, next) => {
	const user = req.user.id;
	let review = await Reviews.findById(req.params.id);

	if (!review) {
		return next(new ErrorResponse(`No review found with matching parameter: ${req.params.id}`));
	}
	if (user !== review.user.toString() && req.user.role !== 'admin') {
		return next(new ErrorResponse('Unauthorized access'), 401);
	}

	review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	res.status(200).json({ succes: true, data: review });
});

// @desc 	Delete review by user
// @route 	DELETE /api/v1/reviews/:id
// @access	Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
	const user = req.user.id;
	const review = await Reviews.findById(req.params.id);

	if (!review) {
		return next(new ErrorResponse(`No review found with matching parameter: ${req.params.id}`));
	}
	if (user !== review.user.toString() && req.user.role !== 'admin') {
		return next(new ErrorResponse('Unauthorized access'), 401);
	}

	await Reviews.findByIdAndDelete(req.params.id);

	res.status(201).json({ succes: true, data: {} });
});
