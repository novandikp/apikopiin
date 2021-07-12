const { body } = require("express-validator");
const db = require("../Util/Database");

function validate() {
  return [
    body("id_barang").custom(checkBarang),
    body("id_order").custom(checkOrder),
  ];
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
async function checkOrder(order) {
  let sql = "select id from orders where id = $1";
  let response = await db.query(sql, [order]);
  new Promise((resolve, reject) => {
    if (response.length == 0) {
      reject("Order tidak ditemukan");
    } else {
      resolve();
    }
  });
}
module.exports = validate;
