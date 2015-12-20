var express = require("express");
console.log("Starting Tile Puzzle!");

var app = express();
app.use(express.static('public'));

app.get("/", function(req, res) {
  res.render('index');
});

var server = app.listen(3000, function() {
  var port = server.address().port;

  console.log("Tile Puzzle server started, listening on %s", port);
})