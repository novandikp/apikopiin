const { body } = require("express-validator");
const db = require("../Util/Database");

function validate() {
  return [
    body("deskripsi").notEmpty(),
    body("id_order_detail").custom(checkDetail),
    body("rating").isNumeric(),
  ];
}

async function checkDetail(order_detail) {
  let sql = "select id from order_detail where $1";
  let response = await db.query(sql, [order_detail]);
  new Promise((resolve, reject) => {
    if (response.length == 0) {
      reject("Detail tidak ditemukan");
    } else {
      resolve();
    }
  });
}
module.exports = validate;
