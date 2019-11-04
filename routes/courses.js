const { getCourses, getCoursesById, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResult');

const express = require('express');
// Merge re-routed routes
const router = express.Router({ mergeParams: true });

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
	.post(addCourse);

//  default/:id
router.route('/:id').get(getCoursesById).put(updateCourse).delete(deleteCourse);

module.exports = router;
