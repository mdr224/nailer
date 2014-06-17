// initialization
var connect = require('connect');
var express = require('express');
var mongojs = require('mongojs');
var mongo = require('mongodb');
var flat = require('flat');
var fs = require('fs');

var app = express();

app.use(connect.json());
app.use(connect.urlencoded());
app.use(connect.multipart());

var url = 'mongodb://heroku_app26443906:qjc89p63q5iicq4lqdnkmfehtb@ds033828.mongolab.com:33828/heroku_app26443906';
var collections = ['identify'];
var db = mongojs(url, collections);

// post requests (HTTP)
app.post('/', function (req, res) {
	var flattened = flat.flatten(req.body);
	if (req.body.type == 'identify') {
		db.identify.save(flattened);
	} else if (req.body.type == 'page') {

	}
	res.end();
});

app.post('/identify', function (req, res) {
	var begin = new Date(req.body.begin);
	var end = new Date(req.body.end);
	console.log ("searching between ", begin, end);

	db.identify.find(function (err, doc) {
		if (err)
			console.error(err);
		else
			console.log(doc);
	});

	res.end();
});

// get requests (HTTP)
app.get('/identify', function (req, res) {
	fs.readFile('form.html', function (err, data) {
		res.writeHead(200, {'Content-Type': 'text/html',
							'Content-Length': data.length });
		res.write(data);
		res.end();
	});
});

app.get('/', function (req, res) {
	res.send('Ain\t nuttin.');
});

// start the server
var port = Number(process.env.PORT || 5000)
var server = app.listen(port, function () {
	console.log('Listening on port %d', server.address().port);
});