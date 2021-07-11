const { body } = require("express-validator");
const db = require("../Util/Database");
function validate() {
  return [
    body("jenis").notEmpty().withMessage("Jenis tidak boleh kosong"),
  
  ];
}

module.exports = validate;
