var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/OrderDetailValidation");

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT order_detail.id, id_order, order_detail.id_barang, id_varian, order_detail.harga, jumlah, keterangan,  id_user,  tgl_order, no_faktur, metode_pembayaran, status, no_resi, nama, deskripsi, berat, stok, COALESCE(varian.nama_varian,'-') FROM order_detail
    inner join barang on order_detail.id_barang = barang.id
    inner join orders on order_detail.id_order= orders.id
    inner join users on orders.id_user = users.id
    LEFT join varian on order_detail.id_varian = varian.id`
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
    `SELECT order_detail.id, id_order, order_detail.id_barang, id_varian, order_detail.harga, jumlah, keterangan,  id_user,  tgl_order, no_faktur, metode_pembayaran, status, no_resi, nama, deskripsi, berat, stok, COALESCE(varian.nama_varian,'-') FROM order_detail
    inner join barang on order_detail.id_barang = barang.id
    inner join orders on order_detail.id_order= orders.id
    inner join users on orders.id_user = users.id
    LEFT join varian on order_detail.id_varian = varian.id where order_detail.id = $1`,
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
  let sql = `INSERT INTO public.order_detail(
    id_order, id_barang, id_varian, harga, jumlah, keterangan)
    VALUES ( $1, $2, $3, $4, $5, $6);`;
  let data = [
    req.body.id_order,
    req.body.id_barang,
    req.body.id_varian,
    req.body.harga,
    req.body.jumlah,
    req.body.keterangan,
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
  let sql = `UPDATE public.order_detail
	SET id_order=$1, id_barang=$2, id_varian=$3, harga=$4, jumlah=$5, keterangan=$6
  where id=$7`;
  let data = [
    req.body.id_order,
    req.body.id_barang,
    req.body.id_varian,
    req.body.harga,
    req.body.jumlah,
    req.body.keterangan,
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
  let sql = `DELETE FROM order_detail WHERE id=$1`;
  let data = [id];
  koneksi.any(sql, data);
  res.status(200).json({
    status: true,
    data: exists[0],
  }); //
});
module.exports = router;
