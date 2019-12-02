const express = require('express');
const router = express.Router({ mergeParams: true });
const { createReview, getReviewById, getReviews, updateReview, deleteReview } = require('../controllers/reviews');

const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');

const advancedResults = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');

router
	.route('/')
	.get(
		advancedResults(Review, {
			path: 'bootcamp',
			select: 'name description'
		}),
		getReviews
	)
	.post(protect, authorize('admin', 'user'), createReview);

router
	.route('/:id')
	.get(getReviewById)
	.put(protect, authorize('user', 'admin'), updateReview)
	.delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
