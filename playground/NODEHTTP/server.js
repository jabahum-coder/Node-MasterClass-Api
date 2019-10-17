// HTTP REVIEW
const http = require('http');

const PORT = 5000;

const todos = [ { id: 1, text: 'todo one' }, { id: 2, text: 'todo two' }, { id: 3, text: 'todo three' } ];

const server = http.createServer(function(req, res) {
	res.statusCode = 201;
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Powered-By', 'Node.js');
	// Better -v below
	res.writeHead();

	res.end(
		JSON.stringify({
			success: true,
			data: todos
		})
	);
});

server.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
