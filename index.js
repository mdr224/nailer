// initialization
var connect = require('connect');
var express = require('express');
var mongojs = require('mongojs');
var mongo = require('mongodb');
var fast = require('fast-csv');
var flat = require('flat');
var fs = require('fs');

var app = express();

app.use(connect.json());
app.use(connect.urlencoded());
app.use(connect.multipart());

// DB initialization
var url = 'mongodb://heroku_app26443906:qjc89p63q5iicq4lqdnkmfehtb@ds033828.mongolab.com:33828/heroku_app26443906';
var collections = ['alias', 'identify', 'page', 'track'];
var db = mongojs(url, collections);

db.identify.remove( {} );

// post requests (HTTP)
app.post('/', function (req, res) {
	var flattened = flat.flatten(req.body);
	flattened.received_on = new Date();
	if (req.body.type == 'identify') {
		db.identify.save(flattened);
	} else if (req.body.type == 'page') {
		db.page.save(flattened);
	} else if (req.body.type == 'track') {
		db.track.save(flattened);
	}
	res.end();
});

// why does this not get caught above, is
// the first argument not just a prefix?
app.post('/alias', function (req, res) {
	var begin = new Date(req.body.begin);
	var end = new Date(req.body.end);
	console.log ("searching in alias between ", begin, end);

	db.alias.find({received_on: {$gte: begin, $lt: end}}, function (err, doc) {
		if (err) console.error(err);
		else {
			respondWithCSV(doc, res);
		}
	});
});

app.post('/identify', function (req, res) {
	var begin = new Date(req.body.begin);
	var end = new Date(req.body.end);
	console.log ("searching in identify between ", begin, end);

	db.identify.find({received_on: {$gte: begin, $lt: end}}, function (err, doc) {
		if (err) console.error(err);
		else {
			respondWithCSV(doc, res);
		}
	});
});

app.post('/page', function (req, res) {
	var begin = new Date(req.body.begin);
	var end = new Date(req.body.end);
	console.log ("searching in page between ", begin, end);

	db.page.find({received_on: {$gte: begin, $lt: end}}, function (err, doc) {
		if (err) console.error(err);
		else {
			respondWithCSV(doc, res);
		}
	});
});

app.post('/track', function (req, res) {
	var begin = new Date(req.body.begin);
	var end = new Date(req.body.end);
	console.log ("searching in track between ", begin, end);

	db.track.find({received_on: {$gte: begin, $lt: end}}, function (err, doc) {
		if (err) console.error(err);
		else {
			respondWithCSV(doc, res);
		}
	});
});

// get requests (HTTP)
app.get('/alias', function (req, res) {
	respondWithHTML('html/alias_form.html', res);
});

app.get('/identify', function (req, res) {
	respondWithHTML('html/identify_form.html', res);
});

app.get('/page', function (req, res) {
	respondWithHTML('html/page_form.html', res);
});

app.get('/track', function (req, res) {
	respondWithHTML('html/track_form.html', res);
});

app.get('/', function (req, res) {
	respondWithHTML('html/main.html', res);
});

// sending responses back
function respondWithCSV (data, response) {
	response.writeHead(200, {'Content-Type': 'text/csv'});
	fast.writeToStream(response, data);
}

function respondWithHTML (filename, response) {
	fs.readFile(filename, function (err, data) {
		if (err) {
			console.error(err)
		} else {
			response.writeHead(200, {'Content-Type': 'text/html',
								'Content-Length': data.length });
			response.write(data);
			response.end();
		}
	});
}

// start the server
var port = Number(process.env.PORT || 5000)
var server = app.listen(port, function () {
	console.log('Listening on port %d', server.address().port);
});
