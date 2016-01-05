var express = require("express");
var bodyParser = require('body-parser');
var session = require("express-session");
console.log("Starting Tile Puzzle!");

var app = express();
app.use(express.static('public'));
app.use(bodyParser.json()); // json request parsing middleware
app.use(session({
  resave: true,
  name: "tile-puzzle.sid",
  saveUnitialized: false,
  secret: "tile-puzzle secret" // the secret should not be here, but that's ok for right now
}));

// high score data structure just kept in memory.
// Ideally this would be persisted in a datastore
var scores = {};

function updateHighScore(id, score) {
  console.log("id: ", id);
  var previousScore = scores[id];
  console.log("previous score: ", previousScore);
  if (!previousScore) {
    scores[id] = score;
  } else {
    if (score < previousScore) {
      console.log("updating high score for user id ", id, " to score: ", score);
      scores[id] = score;
    }
  }
}

function getHighScore(id) {
  return scores[id];
}

app.get("/", function(req, res) {
  res.render('index');
});

app.get("/api/highScore", function(req, res) {
  res.json(getHighScore(req.sessionID));
});

app.post("/api/highScore", function(req, res) {
  var body = req.body;
  // use session id to identify users
  var sessionID = req.sessionID;
  updateHighScore(sessionID, body.score);
  res.json(getHighScore(sessionID));
});

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log("Tile Puzzle server started, listening on %s", port);
});