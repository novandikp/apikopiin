const { body } = require("express-validator");
const db = require("../Util/Database");

function validate() {
  return [body("id_barang").custom(checkBarang)];
}

async function checkBarang(barang) {
  let sql = "select id from barang where id = $1";
  let response = await db.query(sql, [barang]);
  new Promise((resolve, reject) => {
    if (response.length == 0) {
      reject("Barang tidak ditemukan");
    } else {
      resolve();
    }
  });
}
module.exports = validate;
