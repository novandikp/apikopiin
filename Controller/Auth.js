var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");
const { generate } = require("../Util/JWT");
const { encrypt } = require("../Util/Encrypt");
const validate = require("../Validation/RegisterValidation");
const handlerInput = require("../Util/ValidationHandler");

router.post("/register", validate(), handlerInput, async function (req, res) {
  let sql = `INSERT INTO public.users(
    username, nama_lengkap, password, email, no_telp)
   VALUES ( $1, $2, $3, $4, $5) RETURNING ID;`;
  let data = [
    req.body.username,
    req.body.nama_lengkap,
    encrypt(req.body.password),
    req.body.email,
    req.body.no_telp,
  ];

  try {
    let user = await koneksi.one(sql, data);
    req.body.id = user.id;
    let token = generate(req.body.username);
    res.status(200).json({
      status: true,
      data: req.body,
      token: token,
    });
  } catch (e) {
    res.status(406).json({
      status: false,
    });
  }
});

router.post("/email", async function (req, res, next) {
  let sql = `SELECT * FROM users where email=$1 AND id!=$2`;
  let data = [req.body.email, req.body.id];
  let result = await koneksi.any(sql, data);
  if (result.length == 0) {
    res.json({
      status: true,
      message: "Email belum terdaftar",
    });
  } else {
    res.status(404).json({
      status: false,
      errorMessage: "Email sudah terdaftar",
    });
  }
  //
});

router.post("/login", async function (req, res, next) {
  let sql = `SELECT * FROM users where (email=$1 or username=$1) and password=$2`;
  let data = [req.body.username, encrypt(req.body.password)];
  let result = await koneksi.any(sql, data);
  if (result.length > 0) {
    let token = generate(result[0].username, result[0].roles);
    res.json({
      status: true,
      token: token,
      data: result[0],
    });
  } else {
    res.status(404).json({
      status: false,
      errorMessage:
        "Username atau Password tidak ditemukan. Harap periksa kembali data yang anda inputkan.",
    });
  }
  //
});

module.exports = router;
