const ErrorResponse = require('../utils/ErrorResponse');
const errorHandler = (err, req, res, next) => {
	let error = { ...err };

	// Mongoose bad ObjectID
	if (err.name === 'CastError') {
		const message = 'Bad request. No matches found';

		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || err.message
	});
};

module.exports = errorHandler;
