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

// NOTE: TEMPORARY
db.alias.remove( {} );
db.identify.remove( {} );
db.page.remove( {} );
db.track.remove( {} );

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
	db.alias.find(searchOptions(req.body.begin, req.body.end, req.body.userid), csvCallback(res));
});

app.post('/identify', function (req, res) {
	db.identify.find(searchOptions(req.body.begin, req.body.end, req.body.userid), csvCallback(res));
});

app.post('/page', function (req, res) {
	db.page.find(searchOptions(req.body.begin, req.body.end, req.body.userid), csvCallback(res));
});

app.post('/track', function (req, res) {
	db.track.find(searchOptions(req.body.begin, req.body.end, req.body.userid), csvCallback(res));
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

// helper methods
function searchOptions (begin, end, userid) {
	var options = {};

	if (begin != undefined && end != undefined) {
		options.received_on = {$gte: new Date(begin), $lt: new Date(end)};
	} else if (begin != undefined) {
		options.received_on = {$gte: new Date(begin), $lt: new Date(2050, 1, 1, 0, 0, 0)};
	} else if (end != undefined) {
		options.received_on = {$gte: new Date(1970, 1, 1, 0, 0, 0), $lt: new Date(end)};
	}

	if (userid != '') {
		options.userId = userid;
	}

	return options;
}

function csvCallback (response) {
	return (function (err, doc) {
		if (err) {
			console.error(err);
		} else {
			respondWithCSV(doc, response);
		}
	});
}

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
