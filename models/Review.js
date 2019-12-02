// Typo createdAt leave it for now since db seeded
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [ true, 'Please add a review title' ],
		maxlength: 100
	},
	text: {
		type: String,
		required: [ true, 'Please add some text' ]
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [ true, 'Please add a rating between 1 and 10' ]
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	}
});

// User can only add one review by adding index
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId }
		},
		{
			$group: {
				_id: '$bootcamp',
				averageRating: { $avg: '$rating' }
			}
		}
	]);

	const { averageRating } = obj[0];

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, { averageRating });
	} catch (err) {
		console.error(err);
	}
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
	this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.pre('remove', function() {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
