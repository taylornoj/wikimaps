// load .env data into process.env
require("dotenv").config();

// Web server config



// Install the cookie-session ::
// npm install cookie-session ::
const cookieSession = require('cookie-session');




const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes,
// yellow for client error codes, cyan for redirection codes,
// and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));


// +++++++++++ Add this cookie here ::
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const mapsRoutes = require("./routes/maps");
const markersRoutes = require("./routes/markers");
const favouritesRoutes = require("./routes/favourites");


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/maps", mapsRoutes(db));
app.use("/api/markers", markersRoutes(db));
app.use("/api/favourites", favouritesRoutes(db));


// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).





// Delete after DB works ::
const users = {
  userRandomID: {
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};





app.get("/", (req, res) => {
  const user = req.session.id;

  res.render("index", {user: user});
});






app.get("/login", (req, res) => {
  const user = req.session.id;

  res.render("login", {user: user});
});





app.post("/login", (req, res) => {
  const body = req.body;

  req.session.id = body.email;

  res.redirect("/");
});





app.get("/register", (req, res) => {
  const user = req.session.id;

  res.render("register", {user: user});
});



app.post("/register", (req, res) => {

  const newUser = {
    email: req.body.email,
    password: req.body.password,
  };

  users["newUserId"] = newUser;

  res.redirect("/login");
});




// LogOut ::
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/");
});





app.get("/createmap", (req, res) => {



  res.render("createmap");
});



app.get("/maps", (req, res) => {

  res.render("maps_index");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
