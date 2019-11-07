const fs = require('fs');

exports.readFile = (path) => {
	return JSON.parse(fs.readFileSync(`${__dirname}/../${path}`, 'utf-8'));
};
