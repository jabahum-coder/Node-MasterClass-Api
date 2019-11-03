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
	// Copy req.query
	let reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = [ 'select', 'sort', 'page', 'limit' ];

	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach((params) => delete reqQuery[params]);

	//Create query string
	let queryStr = JSON.stringify(reqQuery);
	/* note: the above is necessary in order to use the replace method, using object.entries and finding the key is way too complicated when there is a simpler method */

	// Regex for query match & replace to create operators
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
	// Finding & executing resource
	query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
	// note: ref to mongoose for methods such as skip, limit, etc

	// Select Fields
	if (req.query.select) {
		/*  
		req.query is an object
		select: value is a string with comma seperated values
		i.e 'name,description'
		*/

		const fileds = req.query.select.split(',').join(' ');
		query = query.select(fileds);
	}

	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createAt');
	}
	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIdx = (page - 1) * limit;
	const endIdx = page * limit;
	const total = await Bootcamp.find(JSON.parse(queryStr)).countDocuments();
	query = query.skip(startIdx).limit(limit);

	// Executiing query
	const bootcamps = await query;

	// Pagination
	const pagination = {};

	if (endIdx < total) {
		pagination.next = {
			page: page + 1,
			limit
		};
	}
	if (startIdx > 0) {
		pagination.prev = {
			page: page - 1,
			limit
		};
	}
	res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
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
	// update: find by ID to use middleware delete func
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(new ErrorResponse(`No matching bootcamp found`, 404));
	}
	// required for Schema.pre middleware
	bootcamp.remove();
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
