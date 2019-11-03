// bootcamp reseeder -remove[removeField]

const fs = require('fs');

const location = `${__dirname}/../_data/bootcamps.json`;

const filePath = JSON.parse(fs.readFileSync(location, 'utf-8'));

const removeField = [ 'averageCost' ];

let newFile = filePath.map((element) => {
	delete element[removeField];

	return element;
});

data = JSON.stringify(newFile, null, 2);

fs.writeFileSync(location, data);
