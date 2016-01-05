var express = require("express");
var bodyParser = require('body-parser');

console.log("Starting Tile Puzzle!");

var app = express();
app.use(express.static('public'));
app.use(bodyParser.json()); // json request parsing middleware

// high score data structure just kept in memory.
// Ideally this would be persisted in a datastore
var scores = {
  user1: 29
};

function updateHighScore(userId, score) {
  var previousScore = scores[userId];
  if (previousScore) {
    if (score < previousScore) {
      console.log("Updating high score for user id", userId);
      scores[userId] = score;
    }
  } else {
    console.log("Init score for user id", userId);
  }
}

app.get("/", function(req, res) {
  res.render('index');
});

app.get("/api/highScore/:userId", function(req, res) {
  var userId = req.params.userId;
  res.json({
    userId: userId,
    score: scores[userId]
  });
});

app.post("/api/highScore", function(req, res) {
  var body = req.body;
  var userId = body.userId;
  updateHighScore(userId, body.score);
  res.json({
    userId: userId,
    score: scores[userId]
  });
});

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log("Tile Puzzle server started, listening on %s", port);
});