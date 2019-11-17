const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const { readFile } = require('./utils/readFile');

// Load env vars
dotenv.config({
	path: './config/config.env'
});

// Laod models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

// Read json files
const bootcamps = readFile('/_data/bootcamps.json');
const courses = readFile('/_data/courses.json');
const users = readFile('/_data/users.json');

// Import into DB
const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);
		await Course.create(courses);
		await User.create(users);
		console.log('Data Imported...'.green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};
const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
		await Course.deleteMany();
		await User.deleteMany();
		console.log('Data deleted...'.cyan.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

const deleteUserData = async () => {
	try {
		await User.deleteMany();
		console.log('User Data Deleted...'.blue.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
} else if (process.argv[2] === 'du') {
	deleteUserData();
}
