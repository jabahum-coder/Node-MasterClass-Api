const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc 	Get all bootcamps
// @route 	Get /api/v1/bootcamps
// @access 	Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	// Matching query parameters
	let query;
	let queryStr = JSON.stringify(req.query);
	// Regex for query match & replace
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
	query = await Bootcamp.find(JSON.parse(queryStr));
	const bootcamps = query;
	res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
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
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({ success: true, data: bootcamp });
});

// @desc 	Update bootcamp
// @route 	PUT /api/v1/bootcamps/:id
// @access	 Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp found`, 404));
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc 	Delete bootcamp
// @route 	Delete /api/v1/bootcamps/:id
// @access 	Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	// find by id and delete not findOneAndDelete !!!

	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp found`, 404));
	}
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
