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

const mapsForUser = (id, db) => {
  values = [id];
  db.query(`SELECT * FROM maps WHERE maps.user_id = $1;`, values)
    .then(data => {
      const maps = data.rows[0];
      return maps;
    })
    .catch(err => {
      console.error(err);
    });
};

const getUserByEmailAndPassword = function(email, password) {
  return db.query(`SELECT * FROM users WHERE email = $1 AND password = $2;`, [email, password])
  .then(data => {
      if(data.rowCount === 0){
        return null;
      }
      return data.rows[0];
    })
    .catch(err => {
      console.error(err);
    })

};
/////////////////////////////////////////////
const getUserByEmail = function (email) {
  return db.query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then(data => {
      if (data.rowCount === 0) {
        return null;
      }
      return data.rows[0];
    })
    .catch(err => {
      console.error(err);
    })
};


const getEmail = function (email) {
  return getUserByEmail(email)
    .then(user => {
      if (user) {
        return user;
      }
      return null
    });
}
////////////////////////////////////////////////
const login = function (email, password) {
  return getUserByEmailAndPassword(email, password)
    .then(user => {
      if (user) {
        return user;
      }
      return null
    });
}

// const getUserByEmail = (email) => {
//   values = [email];
//   let user = null;
//   db.query(`SELECT * FROM users WHERE email = $1;`, values)
//   .then(data => {
//       const user = data.rows[0];
//        return user;
//     })
//     .catch(err => {
//       console.error(err);
//     });
//   return user;
// };

const getMapsByUserId = (id) => {
  values = [id];
  let maps = null;
  db.query(`SELECT * FROM maps WHERE user_id = $1;`, values)
    .then(data => {
      const maps  = data.rows[0];
      return maps;
    })
    .catch(err => {
      console.error(err);
    });
  return  maps;
};

// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get("/", (req, res) => {
  const email = req.session.email;
  console.log("email inside /", email);
  user = {email: email};
  templateVars = {user};
  if(email){
     user = { email: email }
    templateVars = { user }
    res.render("index", templateVars);
  }
  res.render("login", templateVars);
});



app.get("/map_user", (req, res) => {
  const email = req.session.email;
/////////////////////////////////

  const user = getEmail(email)
    .then(user => {
      if (user) {
        // res.redirect("/");
        return user
      }
      else {
        const templateVars = { user }
        res.render('login', templateVars);
      }
    })


///////////////////////////////////

  maps = getMapsByUserId(user.id);
  // get the user if he exists or null if not
  let templateVars = {
    user, maps
  };
   res.render("map_user", templateVars);
});



app.get("/login", (req, res) => {
  const email = req.session.email;
  const user = { email: email }
  if (email) {
    res.render("maps_index", { user });
  }
  else {
    res.render("login", {user});
  }

});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  login(email, password)
  .then(user => {
    if(user) {
      req.session.email = req.body.email;
      res.redirect("/");
    }
    else {
      const templateVars = { user }
      res.render('login', templateVars);
      }
    })
});

app.get("/register", (req, res) => {
  const email = req.session.email;
  const user = { email: email }
  if (email) {
    res.render("maps_index", { user });
  }
  else {
    res.render("register", { user });
  }
});


app.post("/register", (req, res) => {
  const name = "try";
  const email = req.body.email;
  const password = req.body.password;
  db.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *`, [name, email, password])
    .then((result) => {
      req.session.email = email;
      //return result.rows[0];
      res.redirect('/maps');
    })
    .catch((err) => console.log(err.message)
    );
});

// LogOut ::
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/createmap", (req, res) => {
  const email = req.session.email;
  const user = {email: email}
  if(user){
    res.render("createmap", { user });
  }
  else{
    res.render("login");
  }
});


////////////////////////////////////
app.get("/maps", (req, res) => {
  const email = req.session.email;
  const user = { email: email }
  if (user) {
    res.render("maps_index", { user });
  }
  else {
    res.render("login");
  }

});
//////////////////////////////////////




app.post("/createmap" , (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  // const created_on = Date().now();
  const user_id = 51;
  db.query(`
  INSERT INTO maps (title, description, longitude, latitude, created_on, user_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *`, [title, description, longitude, latitude, '2021-03-11 09:30:00',  user_id])
      .then((result) =>{
        //return result.rows[0];
        res.redirect('/map_user');
      })
      .catch((err) => console.log(err.message)
      );
});

app.get("/index", (req, res) => {
  console.log("req", req.params)
  // const user = req.session.id;
  // res.render("maps_index", { user: user });
});








app.get("/edit_map", (req, res) => {
  const user = req.session.id;
  res.render("edit_map", {user: user});
});





app.post("/edit_map", (req, res) => {

  const title = req.body.title;
  const description = req.body.description;
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  // const created_on = Date().now();
  const user_id = 1;

  db.query(`UPDATE maps (title, description, longitude, latitude, created_on, user_id)
  SET ($1, $2, $3, $4, $5, $6)
  RETURNING *;`,
  [title, description, longitude, latitude, '2021-03-11 09:30:00',  user_id])
    .then((result) => result.rows[0])
    .catch((err) => console.log(err.message));
  res.redirect("/maps");
});






app.post("/delete", (req, res) => {

  // Need to add a code to delete

  res.redirect("/maps");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
