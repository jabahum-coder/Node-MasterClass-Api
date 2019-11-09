const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc 	Get all bootcamps
// @route 	Get /api/v1/bootcamps
// @access 	Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @desc 	Get single bootcamp
// @route	Get /api/v1/bootcamps/:id
// @access 	Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp found`, 404));
	}

	res.status(200).json({ success: true, data: bootcamp });
});

// @desc 	Create bootcamp
// @route 	POST /api/v1/bootcamps
// @access 	Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	// Add user to req.body
	req.body.user = req.user.id;
	// Check for published bootcamp
	const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
	// If the user is not an admin, they can only add a bootcamp
	if (publishedBootcamp && req.user.role !== 'admin') {
		return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
	}

	const bootcamp = await Bootcamp.create(req.body);

	res.status(201).json({ success: true, data: bootcamp });
});

// @desc 	Update bootcamp
// @route 	PUT /api/v1/bootcamps/:id
// @access	 Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	let bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp found`, 404));
	}
	// Make sure user is bootcamp owner
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`User with id ${req.params.id}, previlege Unauthorized `, 401));
	}

	bootcamp = await await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

	res.status(200).json({ success: true, data: bootcamp });
});

// @desc 	Delete bootcamp
// @route 	Delete /api/v1/bootcamps/:id
// @access 	Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	// find by id and delete not findOneAndDelete !!!
	// update: find by ID to use middleware delete func
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp found`, 404));
	}
	// Make sure user is bootcamp owner
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`User with id ${req.params.id}, previlege Unauthorized `, 401));
	}
	// required for Schema.pre middleware
	await bootcamp.remove();
	res.status(200).json({ success: true, data: {} });
});

// @desc 	Get bootcamp within radius
// @route 	GET /api/v1/bootcamps/radius/:zip/:distance
// @access 	Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	// find by id and delete not findOneAndDelete !!!

	const { zipcode, distance } = req.params;

	// Get lat/long from geocoder
	const loc = await geocoder.geocode(zipcode);
	const { latitude, longitude } = loc[0];

	// Calc radius using radians
	// Divide dist by radius of Earth: 3,963 miles/ 6,378 km
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [ [ longitude, latitude ], radius ] } }
	});

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps
	});
});
//////////////////////////////////////////////////////////////////
// @desc 	Upload photo for bootcamp
// @route 	Put /api/v1/bootcamps/:id/photo
// @access 	Private
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp with id: ${req.params.id}`, 400));
	}
	// Make sure user is bootcamp owner
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`User with id ${req.params.id}, previlege Unauthorized `, 401));
	}

	if (!req.files) {
		return next(new ErrorResponse('Please select a file to upload', 400));
	}
	const file = req.files[''] || req.files.file;

	// Make sure the image is a photo
	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse('Please upload an image file', 400));
	}
	// Check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
	}
	// Create custom filename
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
	// Save file: mv is function on file from upload
	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse('Error with file upload', 500));
		}
		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
		res.status(200).json({ success: true, data: file.name });
	});
});
