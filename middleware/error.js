const ErrorResponse = require('../utils/ErrorResponse');
const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;

	// Mongoose bad ObjectID
	if (err.name === 'CastError') {
		const message = 'Bad request. No matches found';

		error = new ErrorResponse(message, 404);
	}
	// Mongoose duplicate Key
	if (err.code === 11000) {
		const message = 'Duplicate entry';

		error = new ErrorResponse(message, 400);
	}
	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors).map((val) => val.message);

		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || err.message
	});
};

module.exports = errorHandler;
