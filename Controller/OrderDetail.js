var express = require("express");
const db = require("../Util/Database");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/OrderDetailValidation");

//Ambil Keranjang dari user
router.get("/user/:id", async function (req, res) {
  let iduser = req.params.id;
  let data = await koneksi.query(
    `SELECT order_detail.id, id_order, order_detail.id_barang, id_varian, order_detail.harga, jumlah, keterangan,  id_user, nama, deskripsi, berat, stok, COALESCE(varian.nama_varian,'-')  as varian
    FROM order_detail
    inner join barang on order_detail.id_barang = barang.id
    inner join orders on order_detail.id_order= orders.id
    inner join users on orders.id_user = users.id
    LEFT join varian on order_detail.id_varian = varian.id
    where orders.id_user = ${iduser} and status= '0'`
  );
  res.status(200).json({
    status: true,
    data: data,
  });
});

//Detail keranjang user
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

//Masuk keranjang belum ada order pembayaran
router.post("/", validate(), handlerInput, async function (req, res) {
  let idorder;
  let user = req.body.id_user;
  let merchant = req.body.id_merchant;
  let sqlorder =
    "SELECT orders.id FROM order_detail inner join orders on orders.id = order_detail.id_order inner join barang on barang.id = order_detail.id_barang WHERE id_merchant=$1 AND id_user=$2 AND status='0'";
  let order = await db.query(sqlorder, [user, merchant]);
  if (order.length == 0) {
    let idorder = await db.one(
      "INSERT INTO orders (id_user,status) VALUES ($1,$2) RETURNING ID;",
      [user, "0"]
    );
    req.body.id_order = idorder.id;
  } else {
    req.body.id_order = order[0].id;
  }
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

//Ubah Keranjang  jumlah dan keterangan dari id
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.order_detail
	SET  jumlah=$1, keterangan=$2
  where id=$3`;
  let data = [req.body.jumlah, req.body.keterangan, id];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

//Hapus keranjang
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
