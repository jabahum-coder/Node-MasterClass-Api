const { getCourses, getCoursesById, addCourse } = require('../controllers/courses');

const express = require('express');
// Merge re-routed routes
const router = express.Router({ mergeParams: true });

//  default
router.route('/').get(getCourses).post(addCourse);

//  default/:id
router.route('/:id').get(getCoursesById);

module.exports = router;
