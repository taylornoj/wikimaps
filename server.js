// load .env data into process.env
require("dotenv").config();

// Web server config

// Install the cookie-session ::
// npm install cookie-session ::
const cookieSession = require("cookie-session");

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
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

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
  res.render("index", { user: user });
});

app.get("/login", (req, res) => {
  const user = req.session.id;
  res.render("login", { user: user });
});

app.post("/login", (req, res) => {
  const body = req.body;
  req.session.id = body.email;
  res.redirect("/");
});

app.get("/register", (req, res) => {
  const user = req.session.id;
  res.render("register", { user: user });
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

////////////       TESTING!!!! ::::               ////////////////////////////////////





const generateRandomString = function() {
  const arr = [
    "d87s8d",
    "df923j",
    "345gfg",
    "345gdf",
    "567ytr",
    "34fdsf",
    "34dfsf",
    "34fknd",
    "34sskf",
    "34f32f",
    "3dfdsf",
    "34fsds",
    "34fdsf",
    "3d234f",
    "34f5sf",
    "df3fds",
    "sd3dsf",
    "756hsf",
    "sdf345",
    "344fds",
  ];

  let randomNum = Math.random() * 20;
  let roundNumber = Math.floor(randomNum);

  return arr[roundNumber];
};







const cardDatabase = {
  b6UTxQ: {
    userID: "aJ48lW",
    title: "Favourite Parks in Toronto",
    description:
      "Some quick example text to build on the card title and make up the bulk of the card's content.",
    longitude: 43.65107,
    latitude: -79.347015,
    id: "b6UTxQ"
  },
  b6UTxQ2: {
    userID: "aJ48lW",
    title: "Favourite Parks in Toronto",
    description:
      "Some quick example text to build on the card title and make up the bulk of the card's content.",
    longitude: 43.65107,
    latitude: -79.347015,
    id: "b6UTxQ2"
  },
  b6UTxQ3: {
    userID: "aJ48lW",
    title: "Favourite Parks in Toronto",
    description:
      "Some quick example text to build on the card title and make up the bulk of the card's content.",
    longitude: 43.65107,
    latitude: -79.347015,
    id: "b6UTxQ3"
  },
};

// console.log(cardDatabase.b6UTxQ.longitude);

// const coordinates = cardDatabase.b6UTxQ.longitude
// module.exports = {coordinates}

app.get("/maps", (req, res) => {
  const user = req.session.id;
  res.render("maps_index", { user: user, cards: cardDatabase });
});

/////////////////////////////////////////////

app.get("/createmap", (req, res) => {
  const user = req.session.id;
  res.render("createmap", { user: user });
});

app.post("/createmap", (req, res) => {
  console.log("title", req.body.title);
  const title = req.body.title;
  const description = req.body.description;
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  // const created_on = Date().now();
  const user_id = 1;


  const id = generateRandomString()

  cardDatabase[id] = {
    title,
    description,
    longitude,
    latitude,
    id
  }
  
  console.log(cardDatabase);

  res.redirect("/maps")


  db.query(
    `
  INSERT INTO maps (title, description, longitude, latitude, created_on, user_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *`,
    [title, description, longitude, latitude, "2021-03-11 09:30:00", user_id]
  )
    .then((result) => result.rows[0])
    .catch((err) => console.log(err.message));


});

app.get("/edit_map", (req, res) => {
  const user = req.session.id;
  res.render("edit_map", { user: user });
});

app.post("/edit_map", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  // const created_on = Date().now();
  const user_id = 1;

  db.query(
    `UPDATE maps (title, description, longitude, latitude, created_on, user_id)
  SET ($1, $2, $3, $4, $5, $6)
  RETURNING *;`,
    [title, description, longitude, latitude, "2021-03-11 09:30:00", user_id]
  )
    .then((result) => result.rows[0])
    .catch((err) => console.log(err.message));
  res.redirect("/maps");
});






app.post("/delete/:id", (req, res) => {
  // Need to add a code to delete

  delete cardDatabase[req.params.id];

  res.redirect("/maps");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
