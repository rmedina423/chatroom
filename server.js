var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

var server = http.createServer(serverRequestHandler);
server.listen(3000, function () {
	console.log('Server is listening on port 3000.');
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

function serverRequestHandler(request, response) {
	var filePath;
	var absPath;

	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}

	absPath = './' + filePath;

	serveStatic(response, cache, absPath);
}

function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.stat(absPath, function (err, stats) {
			if (stats.isFile()) {
				fs.readFile(absPath, function (err, data) {

					if (err) {
						send404(err);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		})
	}
}