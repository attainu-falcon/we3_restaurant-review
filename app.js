var express = require("express");
var exphbs = require("express-handlebars");
var session = require("express-session");
var bodyparser = require("body-parser");
var mongoClient = require("mongodb").MongoClient;
var user = require("./routes/user");
var resturant = require("./routes/resturant");
var app = express();

var hbs = exphbs.create({
  helpers: {
    calc: function(a, b) {
      return a * b;
    } 
  }
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyparser.urlencoded());
app.use(session({ secret: "Your secret key" }));

var DB_URL =
  "mongodb+srv://naveen:naveen@cluster0-fffik.mongodb.net/test?retryWrites=true&w=majority";
// process.env.DB_URL  || "mongodb://127.0.0.1:27017";
mongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
  app.locals.db = client.db("resturant_review");
});

app.use("/", user);
app.use("/resturant", resturant);

//this route should be last route for the 404 error
app.get("/*", function(req, res) {
  res.render('404',{title:"404 page not found"}) 

});

var PORT = process.env.PORT || 4000;
app.listen(PORT);
