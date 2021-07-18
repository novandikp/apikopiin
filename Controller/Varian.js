var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/VarianValidation");

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT varian.id, id_barang, nama_varian,  id_merchant, id_kategori, nama, deskripsi, harga, berat, stok, users.nama_toko, kategori.nama_kategori FROM varian
    INNER JOIN barang on barang.id = varian.id_barang
    INNER JOIN users on users.id = barang.id_merchant
    INNER JOIN kategori on kategori.id = barang.id_kategori`
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
    `SELECT varian.id, id_barang, nama_varian,  id_merchant, id_kategori, nama, deskripsi, harga, berat, stok, users.nama_toko, kategori.nama_kategori FROM varian
    INNER JOIN barang on barang.id = varian.id_barang
    INNER JOIN users on users.id = barang.id_merchant
    INNER JOIN kategori on kategori.id = barang.id_kategori where varian.id = $1`,
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
  let sql = `INSERT INTO public.varian(
    id_barang, nama_varian)
    VALUES ( $1, $2);`;
  let data = [req.body.id_barang, req.body.nama_varian];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.varian
	SET id_barang=$1, nama_varian=$2
  where id=$3`;
  let data = [req.body.id_barang, req.body.nama_varian, id];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id;
  let sql = `DELETE FROM varian WHERE id=$1`;
  let data = [id];
  koneksi.any(sql, data);
  res.status(200).json({
    status: true,
  }); //
});
module.exports = router;
