const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const bootcamps = require('./routes/bootcamps');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({
	path: './config/config.env'
});

// Connect to database
connectDB();

const app = express();

// Middleware

// Dev logging Middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
// Mount routers

app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(`Server running in: ${process.env.NODE_ENV} mode on port: ${PORT}`.cyan.bold)
);

// Handle uhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red.underline.bold);
	// Close server & exit process
	server.close(() => process.exit(1));
});
