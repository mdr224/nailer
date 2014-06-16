var connect = require('connect');
var express = require('express');
var app = express();

app.use(connect.json());

// get requests (HTTP)
app.get('/', function (req, res) {
	res.send('TODO: Implement');
});

// post requests (HTTP)
app.post('/', function (req, res) {
	console.log(request.body);
});

// start the server
var port = Number(process.env.PORT || 5000)
var server = app.listen(port, function () {
	console.log('Listening on port %d', server.address().port);
});