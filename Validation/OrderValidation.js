const { body } = require("express-validator");
const db = require("../Util/Database");

function validate() {
  return [
    body("id_user").custom(checkUsername),
    body("tgl_order").isDate(),
    body("id_alamat").custom(checkAlamat),
    body("no_faktur").notEmpty(),
    body("metode_pembayaran").notEmpty(),
    body("status").notEmpty(),
    body("no_resi").notEmpty(),
  ];
}

async function checkAlamat(alamat) {
  let sql = "select id from alamat where $1";
  let response = await db.query(sql, [alamat]);
  new Promise((resolve, reject) => {
    if (response.length == 0) {
      reject("Alamat tidak ditemukan");
    } else {
      resolve();
    }
  });
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
