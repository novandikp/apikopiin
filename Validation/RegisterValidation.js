const { body } = require("express-validator");
const db = require("../Util/Database");
function validate() {
  return [
    body("email").custom(checkEmail),
    body("username").custom(checkUsername),
  ];
}

async function checkUsername(username, { req }) {
  let sql;
  if (req.method == "PUT") {
    sql =
      "select username from users where username = $1 and id !='" +
      req.params.id +
      "'";
  } else {
    sql = "select username from users where username = $1";
  }
  let res = await db.query(sql, [username]);
  return new Promise((resolve, reject) => {
    if (res.length > 0) {
      reject("Username telah terpakai, silakan gunakan username dengan kata kunci yang lain.");
    }
    resolve();
  });
}

async function checkEmail(email, { req }) {
  let sql;
  if (req.method == "PUT") {
    sql =
      "select email from users where email = $1 and id !='" +
      req.params.id +
      "'";
  } else {
    sql = "select email from users where email = $1";
  }
  let res = await db.query(sql, [email]);
  return new Promise((resolve, reject) => {
    if (res.length > 0) {
      reject("Email telah terpakai, silakan gunakan email yang lain.");
    }
    resolve();
  });
}

module.exports = validate;
