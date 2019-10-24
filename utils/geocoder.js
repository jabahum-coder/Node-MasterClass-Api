const dotenv = require('dotenv');
// put env in scope with path
dotenv.config({
	path: './config/config.env'
});
const NodeGeocoder = require('node-geocoder');

const options = {
	provider: process.env.GEOCODER_PROVIDER,
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
