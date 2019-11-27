const { getCourses, getCoursesById, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const Course = require('../models/Course');

const express = require('express');
// Merge re-routed routes
const router = express.Router({ mergeParams: true });


const advancedResults = require('../middleware/advancedResult');
// protect
const { protect, authorize } = require('../middleware/auth');

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
	.post(protect, authorize('publisher', 'admin'), addCourse);

//  default/:id
router
	.route('/:id')
	.get(getCoursesById)
	.put(protect, authorize('publisher', 'admin'), updateCourse)
	.delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
