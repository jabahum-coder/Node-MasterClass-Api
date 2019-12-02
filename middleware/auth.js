const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
	// Get token from headers
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies) {
		token = req.cookies.token;
	}

	// Make sure token exist
	if (!token) {
		return next(new ErrorResponse('Unauthorized access', 401));
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findById(decoded.id);
		next();
	} catch (error) {
		return next(new ErrorResponse('Unauthorized access', 401));
	}
});

// Grant accest to specific roles

exports.authorize = (...roles) => (req, res, next) => {
	const role = req.user.role;
	if (!roles.includes(req.user.role)) {
		return next(new ErrorResponse(`User role ${role} is unauthrized to access this route  `, 403));
	}
	next();
};
