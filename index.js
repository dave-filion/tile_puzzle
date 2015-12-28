var express = require("express");
var bodyParser = require('body-parser');
console.log("Starting Tile Puzzle!");

var app = express();
app.use(express.static('public'));
app.use(bodyParser.json()); // json request parsing middleware

// high score data structure just kept in memory.
// Ideally this would be persisted in a datastore
var highScores = {
  bob: 12,
  steve: 44
};

function updateHighScore(userId, score) {
  var previousScore = highScores[userId];
  if (!previousScore) {
    highScores[userId] = parseInt(score);
  } else {
    // lower score is better
    var intScore = parseInt(score);
    if (previousScore > score) {
      highScores[userId] = score;
    }
  }
  return highScores;
}

app.get("/", function(req, res) {
  res.render('index');
});

app.get("/api/highScore", function(req, res) {
  res.json(highScores);
});

app.post("/api/highScore", function(req, res) {
  var body = req.body;
  var updatedScores = updateHighScore(body.userId, body.score);
  res.json(updatedScores);
});

var server = app.listen(3000, function() {
  var port = server.address().port;

  console.log("Tile Puzzle server started, listening on %s", port);
})