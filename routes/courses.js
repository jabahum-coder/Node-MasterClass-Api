const { getCourses, getCoursesById, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResult');

const express = require('express');
// Merge re-routed routes
const router = express.Router({ mergeParams: true });

// protect
const { protect } = require('../middleware/auth');

//  default
router
	.route('/')
	.get(
		advancedResults(Course, {
			path: 'bootcamp',
			select: 'name description'
		}),
		getCourses
	)
	.post(protect, addCourse);

//  default/:id
router.route('/:id').get(getCoursesById).put(protect, updateCourse).delete(protect, deleteCourse);

module.exports = router;
