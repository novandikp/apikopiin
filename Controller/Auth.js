var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");
const { generate } = require("../Util/JWT");
const { encrypt } = require("../Util/Encrypt");
const validate = require("../Validation/RegisterValidation");
const handlerInput = require("../Util/ValidationHandler");

router.post("/register", validate(), handlerInput, async function (req, res) {
  let sql = `INSERT INTO public.users(
    username, nama_lengkap, nama_toko, jenis_toko, password, email, no_telp)
   VALUES ( $1, $2, $3, NULL, $4, $5, $6);`;
  let data = [
    req.body.username,
    req.body.nama_lengkap,
    "-",
    encrypt(req.body.password),
    req.body.email,
    req.body.no_telp,
  ];
  // console.log('args', data)
  try {
    await koneksi.none(sql, data);
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
    res.status(404).json({ status:false,message: "Username atau Password tidak ditemukan" });
  }
  //
});

module.exports = router;
