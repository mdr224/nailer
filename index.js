// initialization
var connect = require('connect');
var express = require('express');
var mongojs = require('mongojs');
var mongo = require('mongodb');
var moment = require('moment-timezone');
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

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use('/javascript', express.static(__dirname + '/javascript'));

// NOTE: TEMPORARY
/*db.alias.remove( {} );
db.identify.remove( {} );
db.page.remove( {} );
db.track.remove( {} );*/

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
  db.alias.find(
    searchOptions(req.body.begin, req.body.end, req.body.userid, req.body.timezone),
    csvCallback(res, req.body.timezone));
});

app.post('/identify', function (req, res) {
  db.identify.find(
    searchOptions(req.body.begin, req.body.end, req.body.userid, req.body.timezone),
    csvCallback(res, req.body.timezone));
});

app.post('/page', function (req, res) {
	db.page.find(
    searchOptions(req.body.begin, req.body.end, req.body.userid, req.body.timezone),
    csvCallback(res, req.body.timezone));
});

app.post('/track', function (req, res) {
	db.track.find(
    searchOptions(req.body.begin, req.body.end, req.body.userid, req.body.timezone),
    csvCallback(res, req.body.timezone));
});

// get requests (HTTP)
app.get('/alias', function (req, res) {
  res.render('csv_scope_form',
  {title : 'Alias', target : '/alias'})
});

app.get('/identify', function (req, res) {
  res.render('csv_scope_form',
  {title : 'Identify', target : '/identify'})
});

app.get('/page', function (req, res) {
  res.render('csv_scope_form',
  {title : 'Page', target : '/page'})
});

app.get('/track', function (req, res) {
  res.render('csv_scope_form',
  {title : 'Track', target : '/track'})
});

app.get('/', function (req, res) {
  res.render('home',
  {title : 'Home'})
});

// helper methods
function searchOptions (begin, end, userid, timezone) {
	var options = {};

  if (begin != '')
    begin_utc = new Date(moment.tz(begin, timezone).utc())

  if (end != '')
    end_utc = new Date(moment.tz(end, timezone).utc())

	if (begin != '' && end != '') {
		options.received_on = {
      $gte: begin_utc,
      $lte: end_utc 
    };
	} else if (begin != '') {
		options.received_on = {$gte: begin_utc};
  } else if (end != '') {
		options.received_on = {$lt: end_utc};
	}

	if (userid != '') {
		options.userId = userid;
	}

	return options;
}

function csvCallback (response, timezone) {
	return (function (err, doc) {
		if (err) {
			console.error(err);
		} else {
			respondWithCSV(doc, response, timezone);
		}
	});
}

// sending responses back
function respondWithCSV (data, response, timezone) {
	response.writeHead(200, {'Content-Type': 'text/csv'});
	fast.writeToStream(response, data
  , {
    transform: function(row) {
      row.received_on = moment(row.received_on).tz(timezone).format();
      row.receivedAt = moment(row.receivedAt).tz(timezone).format();
      row.timestamp = moment(row.timestamp).tz(timezone).format();
      return row
    }
    }
  );
}

// start the server
var port = Number(process.env.PORT || 5000)
var server = app.listen(port, function () {
	console.log('Listening on port %d', server.address().port);
});
