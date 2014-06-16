// initialization
var connect = require('connect');
var express = require('express');
var mongojs = require('mongojs');
var mongo = require('mongodb');
var flat = require('flat');

var app = express();

app.use(connect.json());

var url = 'mongodb://heroku_app26443906:qjc89p63q5iicq4lqdnkmfehtb@ds033828.mongolab.com:33828/heroku_app26443906';
var collections = ['identify'];
var db = mongojs(url, collections);

// post requests (HTTP)
app.post('/', function (req, res) {
	var flattened = flat.flatten(req.body);
	if (req.body.type == 'identify') {
		db.identify.save(flattened);
		db.identify.find(function (err, docs) {
			console.log(docs);
		});
	} //...
	res.end();
});

// get requests (HTTP)
app.get('/', function (req, res) {
	res.send('TODO: Implement');
});

// start the server
var port = Number(process.env.PORT || 5000)
var server = app.listen(port, function () {
	console.log('Listening on port %d', server.address().port);
});