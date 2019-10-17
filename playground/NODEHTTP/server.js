// HTTP REVIEW
const http = require('http');

const PORT = 5000;

const todos = [ { id: 1, text: 'todo one' }, { id: 2, text: 'todo two' }, { id: 3, text: 'todo three' } ];

const server = http.createServer(function(req, res) {
	// res.statusCode = 201;
	// res.setHeader('Content-Type', 'application/json');
	// res.setHeader('X-Powered-By', 'Node.js');

	// Better -v below res.writeHead(status,data)

	// Send custom body data
	const { method, url } = req;
	let body = [];

	req
		.on('data', (chunk) => {
			body.push(chunk);
		})
		.on('end', () => {
			body = Buffer.concat(body).toString();

			let status = 404;
			const response = {
				success: false,
				data: null,
				error: null
			};

			if (method === 'GET' && url === '/todos') {
				status = 200;
				response.success = true;
				response.data = todos;
			} else if (method === 'POST' && url === '/todos') {
				const { id, text } = JSON.parse(body);

				if (!id || !text) {
					status = 400;
					response.error = 'Please add id and text';
				} else {
					todos.push({ id, text });
					status = 201;
					response.success = true;
					response.data = todos;
				}
			}

			res.writeHead(status, {
				'Content-Type': 'application/json',
				'X-Powered-By': 'Node.js'
			});

			res.end(JSON.stringify(response));
		});
});

server.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
