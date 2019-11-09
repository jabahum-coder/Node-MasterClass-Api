const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');

// @desc 	GET courses
// @route 	GET /api/v1/courses/
// @route 	GET /api/v1/bootcamps/:bootcampId/courses
// @access	 Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const courses = await Course.find({ bootcamp: req.params.bootcampId });

		res.status(200).json({ success: true, count: courses.length, data: courses });
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @desc 	GET  single course
// @route 	GET /api/v1/courses/:id
// @access	 Public
exports.getCoursesById = asyncHandler(async (req, res, nex) => {
	const course = await Course.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description'
	});

	if (!course) {
		return next(new ErrorResponse(`No matching course with the id of ${req.params.id}`), 404);
	}

	res.status(200).json({ success: true, data: course });
});

// @desc 	Add courses
// @route 	POST /api/v1/bootcamps/:bootcampId/courses
// @access	 Private
exports.addCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;
	const bootcamp = await Bootcamp.findById(req.params.bootcampId);
	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp with the id of ${req.params.id}`), 404);
	}
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`User with id ${req.user.id}, previlege Unauthorized `, 401));
	}
	const course = await Course.create(req.body);

	res.status(200).json({ success: true, data: course });
});

// @desc 	Updaate courses
// @route 	PUT /api/v1/courses/:id
// @access	 Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	const queryId = req.params.id;
	let course = await Course.findById(queryId);

	if (!course) {
		return next(new ErrorResponse(`No course matching id: ${queryId}`, 404));
	}
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`User with id ${req.user.id}, previlege Unauthorized `, 401));
	}

	course = await Course.findByIdAndUpdate(queryId, req.body, {
		new: true,
		runValidators: true
	});

	res.status(200).json({ success: true, data: course });
});

// @desc 	Delet course
// @route 	Delete /api/v1/courses/:id
// @access	 Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);
	if (!course) {
		return next(new ErrorResponse(`No matching course found with id: ${req.params.id}`, 404));
	}
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`User with id ${req.user.id}, previlege Unauthorized `, 401));
	}

	// required for  middleware
	await course.remove();

	res.status(200).json({ success: true, data: {} });
});
