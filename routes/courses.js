const { getCourses, getCoursesById, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');

const express = require('express');
// Merge re-routed routes
const router = express.Router({ mergeParams: true });

//  default
router.route('/').get(getCourses).post(addCourse);

//  default/:id
router.route('/:id').get(getCoursesById).put(updateCourse).delete(deleteCourse);

module.exports = router;
