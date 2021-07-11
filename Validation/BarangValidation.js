const { body } = require("express-validator");
const db = require("../Util/Database");

function validate() {
  return [
    body("id_merchant").custom(checkUsername),
    body("nama").notEmpty(),
    body("deskripsi").notEmpty(),
    body("id_kategori").custom(checkKategori),
    body("harga").isNumeric(),
    body("stok").isNumeric(),
    body("berat").isNumeric(),
  ];
}

async function checkKategori(jenis) {
  let sql = "select id from kategori where $1";
  let response = await db.query(sql, [jenis]);
  new Promise((resolve, reject) => {
    if (response.length == 0) {
      reject("Kategori tidak ditemukan");
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
