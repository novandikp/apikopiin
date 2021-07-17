var express = require("express");
const db = require("../Util/Database");
var router = express.Router();
var koneksi = require("../Util/Database");
const { encrypt, decrypt } = require("../Util/Encrypt");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/UserValidation");

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT users.id, username, nama_lengkap, nama_toko, jenis_toko, "password", email, no_telp, jenis_toko.jenis from users left join jenis_toko ON users.jenis_toko = jenis_toko.id`
  );
  res.status(200).json({
    status: true,
    data: data,
  });
});

//GET BY ID
router.get("/:id", async function (req, res, next) {
  let id = req.params.id;

  let data = await koneksi.query(
    `SELECT users.id, username, nama_lengkap, nama_toko, jenis_toko, "password", email, no_telp, jenis_toko.jenis from users left join jenis_toko ON users.jenis_toko = jenis_toko.id where users.id = $1`,
    [id]
  );

  if (data.length == 1) {
    res.status(200).json({
      status: true,
      data: data[0],
    });
  } else {
    res.status(204).json({
      status: false,
      data: [],
    });
  }
});

//INSERT
router.post("/", validate(), handlerInput, function (req, res) {
  let sql = `INSERT INTO public.users(
	 username, nama_lengkap, nama_toko, jenis_toko, password, email, no_telp)
	VALUES ( $1, $2, $3, $4, $5, $6, $7);`;
  let data = [
    req.body.username,
    req.body.nama_lengkap,
    req.body.nama_toko,
    req.body.jenis_toko,
    req.body.password,
    req.body.email,
    req.body.no_telp,
  ];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

//UPDATE Profil
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.users
  SET  username=$1, nama_lengkap=$2,  email=$3, no_telp=$4 where id=$5`;
  let data = [
    req.body.username,
    req.body.nama_lengkap,
    req.body.email,
    req.body.no_telp,
    id,
  ];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

//Update Password
router.put("/password/:id", async function (req, res) {
  let id = req.params.id;
  let passwordlama = req.body.old_password;
  let check = `SELECT id from users WHERE password=$1 and id=$2`;
  let data = await db.query(check, [encrypt(passwordlama), id]);

  if (data.length == 0) {
    res.status(406).json({
      status: true,
      errorMessage: "Password Lama Salah",
    });
  } else {
    let sql = `UPDATE users SET password=$1 where id=$2`;
    let data = [encrypt(req.body.password), id];
    koneksi.none(sql, data);
    res.status(200).json({
      status: true,
      message: "Password Berhasil diubah",
    });
  }
});

router.put("/shop/:id", async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.users SET nama_toko=$1, jenis_toko=$2, alamat_toko=$3, lat_toko=$4, long_toko=$5 where id=$6`;
  let data = [
    req.body.nama_toko,
    req.body.jenis_toko,
    req.body.alamat_toko,
    req.body.lat_toko,
    req.body.long_toko,
    id,
  ];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id;
  let sql = `DELETE FROM users WHERE id=$1`;
  let data = [id];
  let exists = await koneksi.any(
    "SELECT id_merchant FROM barang where id_merchant = $1",
    [id]
  );
  let exists2 = await koneksi.any(
    "SELECT id_user FROM orders where id_user = $1",
    [id]
  );
  if (exists.length == 0 && exists2.length == 0) {
    koneksi.any(sql, data);
    res.status(200).json({
      status: true,
      data: exists[0],
    });
  } else {
    res.status(304).json({
      status: false,
      data: [],
    });
  }
  //
});
module.exports = router;
