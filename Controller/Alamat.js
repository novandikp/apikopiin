var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/AlamatValidation");

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT alamat.id, id_user, nama, detail, provinsi, kota, kecamatan, kodepos, alamat.no_telp, latitude, longitude,  username, nama_lengkap, nama_toko, jenis_toko, email,  jenis_toko.jenis from alamat 
    INNER join users on alamat.id_user = users.id
    INNER join jenis_toko on jenis_toko.id = users.jenis_toko`
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
    `SELECT alamat.id, id_user, nama, detail, provinsi, kota, kecamatan, kodepos, alamat.no_telp, latitude, longitude,  username, nama_lengkap, nama_toko, jenis_toko, email,  jenis_toko.jenis from alamat 
    INNER join users on alamat.id_user = users.id
    INNER join jenis_toko on jenis_toko.id = users.jenis_toko where alamat.id = $1`,
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
  let sql = `INSERT INTO public.alamat(
    id_user, nama, detail, provinsi, kota, kecamatan, kodepos, no_telp, latitude, longitude)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;
  let data = [
    req.body.id_user,
    req.body.nama,
    req.body.detail,
    req.body.provinsi,
    req.body.kota,
    req.body.kecamatan,
    req.body.kodepos,
    req.body.no_telp,
    req.body.latitude,
    req.body.longitude,
  ];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.alamat
	SET  id_user=$1, nama=$2, detail=$3, provinsi=$4, kota=$5, kecamatan=$6, kodepos=$7, no_telp=$8, latitude=$9, longitude=$10 where id=$11`;
  let data = [
    req.body.id_user,
    req.body.nama,
    req.body.detail,
    req.body.provinsi,
    req.body.kota,
    req.body.kecamatan,
    req.body.kodepos,
    req.body.no_telp,
    req.body.latitude,
    req.body.longitude,
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
  let sql = `DELETE FROM alamat WHERE id=$1`;
  let data = [id];
  koneksi.any(sql, data);
  res.status(200).json({
    status: true,
    data: exists[0],
  });
  //
});
module.exports = router;
