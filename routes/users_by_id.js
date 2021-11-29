

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get("/:id", (req, res) => {
    values = [`${req.params.id}`];
    db.query(`SELECT * FROM users WHERE id = $1;`, values)
      .then(data => {
        const users = data.rows;
        const dataUsers = { users };
        res.render('index', dataUsers);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
