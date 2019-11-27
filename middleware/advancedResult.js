const advancedResults = (Model, populate) => async (req, res, next) => {
	// Matching query parameters
	let query;
	// Copy req.query
	const reqQuery = { ...req.query };

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
	query = Model.find(JSON.parse(queryStr));
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
		query = query.sort('-createdAt');
	}
	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIdx = (page - 1) * limit;
	const endIdx = page * limit;
	const total = await Model.find(JSON.parse(queryStr)).countDocuments();
	query = query.skip(startIdx).limit(limit);

	if (populate) {
		query = query.populate(populate);
	}

	// Executiing query
	const results = await query;

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

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results
	};

	next();
};

module.exports = advancedResults;
