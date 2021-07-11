const { body } = require("express-validator");
const db = require("../Util/Database");

function validate() {
  return [
    body("id_user").custom(checkUsername),
    body("nama").notEmpty(),
    body("detail").notEmpty(),
    body("provinsi").notEmpty(),
    body("kota").notEmpty(),
    body("kecamatan").notEmpty(),
    body("kodepos").isPostalCode(),
    body("notelp").isMobilePhone(),
    body("latitude").isNumeric(),
    body("longitude").isNumeric(),
  ];
}

async function checkUsername(user) {
  let sql = "select id from users where $1";
  let response = await db.query(sql, [user]);
  new Promise((resolve, reject) => {
    if (response.length == 0) {
      reject("Pengguna tidak ditemukan");
    } else {
      resolve();
    }
  });
}
module.exports = validate;
