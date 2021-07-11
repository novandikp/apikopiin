const { body } = require("express-validator");
const db = require("../Util/Database");
function validate() {
  return [
    body("nama_kategori").notEmpty().withMessage("Nama Kategori tidak boleh kosong"),
  
  ];
}

module.exports = validate;
