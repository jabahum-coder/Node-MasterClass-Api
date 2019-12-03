const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit =  require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// Load env vars
dotenv.config({
	path: './config/config.env'
});

// Connect to database
connectDB();

const app = express();

// Middleware

// Body parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Dev logging Middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

//	File uploading
app.use(fileUpload());

// Sanitize data
app.use(mongoSanitize())

//Set security headers
app.use(helmet())

//Prevent XSS attacks
app.use(xss())

//Rate limiting
const limiter = rateLimit({
	windowMs: 10* 60 * 1000,
	max:100
})

//Prevent http param pollution
app.use(hpp())

// Enable CORS
app.use(cors())

// Set static folder
/* note to self change later to
 app.use(express.static('client/build')); 
 */
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth/', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

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
