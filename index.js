var express = require("express");
var bodyParser = require('body-parser');
var _ = require("lodash");

console.log("Starting Tile Puzzle!");

var app = express();
app.use(express.static('public'));
app.use(bodyParser.json()); // json request parsing middleware

// high score data structure just kept in memory.
// Ideally this would be persisted in a datastore
var highScores = [
  {userId: 'dave', score: 12},
  {userId: 'ste221', score: 15},
  {userId: 'owkd', score: 99}
];

function updateHighScore(userId, score) {
  highScores.push({
    userId: userId,
    score: score
  });
  return highScores;
}

function sortByScore(highScores) {
  return _.sortBy(highScores, 'score');
}

app.get("/", function(req, res) {
  res.render('index');
});

app.get("/api/highScore", function(req, res) {
  res.json(_.take(sortByScore(highScores), 5));
});

app.post("/api/highScore", function(req, res) {
  var body = req.body;
  var updatedScores = updateHighScore(body.userId, body.score);
  res.json(_.take(sortByScore(updatedScores), 5));
});

var server = app.listen(3000, function() {
  var port = server.address().port;

  console.log("Tile Puzzle server started, listening on %s", port);
})