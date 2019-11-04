const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [ true, 'Please add a name' ]
	},
	email: {
		type: String,
		required: [ true, ' Please add an email' ],
		unique: true,
		match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ]
	},
	role: {
		type: String,
		enum: [ 'user', 'publisher' ],
		default: 'user'
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	password: {
		type: String,
		required: [ true, 'Please add a password' ],
		minlength: 6,
		select: false
	},
	createdAt: {
		type: Date,
		default: Date.now,
		immutable: true
	}
});

// Encrypt password
UserSchema.pre('save', async function(next) {
	const salt = bcrypt.genSalt(12);
	this.password = await bcrypt.hash(this.password, salt);

	next();
});

module.exports = mongoose.model('User', UserSchema);
