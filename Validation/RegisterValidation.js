const { body } = require("express-validator");
const db = require("../Util/Database");
function validate() {
  return [
    body("email").isEmail().custom(checkEmail),
    body("username").custom(checkUsername),
    body("nama_lengkap").notEmpty().withMessage("Isi nama lengkap"),
    body("password").isLength({ min: 8 }).withMessage("Password terlalu lemah"),
    body("no_telp").isMobilePhone().withMessage("Nomer telepon tidak valid"),
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
      reject("Username telah dipakai");
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
      reject("Email telah dipakai");
    }
    resolve();
  });
}

module.exports = validate;
