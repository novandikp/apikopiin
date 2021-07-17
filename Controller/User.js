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

//BUAT DAN UPDATE TOKO
router.put("/shop/:id", async function (req, res) {
  let iduser = req.params.id;

  let cekTokoSQL = `SELECT id_merchant from users where id_merchant is not NULL and id = ${iduser}`;
  let rowToko = await db.query(cekTokoSQL);
  if (rowToko.length == 0) {
    let sql = `INSERT INTO public.merchant(
    id_jenis, nama_toko, alamat_toko, lat_toko, long_toko, provinsi,kota,kecamatan, kodepos)
    VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9) RETURNING id;`;
    let data = [
      req.body.jenis_toko,
      req.body.nama_toko,
      req.body.alamat_toko,
      req.body.lat_toko,
      req.body.long_toko,
      req.body.provinsi,
      req.body.kota,
      req.body.kecamatan,
      req.body.kodepos,
    ];
    let datauser = await koneksi.one(sql, data);

    db.none("UPDATE users set id_merchant=$1 WHERE id=$2", [
      datauser.id,
      iduser,
    ]);
    res.status(200).json({
      status: true,
      data: req.body,
    });
  } else {
    let idmerchant = rowToko[0].id_merchant;
    let sql = `UPDATE public.merchant
    SET  id_jenis=$1, nama_toko=$2, alamat_toko=$3, lat_toko=$4, long_toko=$5, provinsi=$6, kota=$7, kecamatan=$8, kodepos=$9
    WHERE id=$10;`;
    let data = [
      req.body.jenis_toko,
      req.body.nama_toko,
      req.body.alamat_toko,
      req.body.lat_toko,
      req.body.long_toko,
      req.body.provinsi,
      req.body.kota,
      req.body.kecamatan,
      req.body.kodepos,
      idmerchant,
    ];
    db.none(sql, data);
    res.status(200).json({
      status: true,
      data: req.body,
    });
  }
});

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id;
  let sql = `DELETE FROM users WHERE id=$1`;
  let data = [id];

  let exists2 = await koneksi.any(
    "SELECT id_user FROM orders where id_user = $1",
    [id]
  );
  if (exists2.length == 0) {
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
