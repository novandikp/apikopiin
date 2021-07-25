var express = require("express");
const db = require("../Util/Database");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/OrderDetailValidation");

//Ambil Keranjang dari user
router.get("/user/:id", async function (req, res) {
  let iduser = req.params.id;
  let orders = await koneksi.query(
    `select orders.id , orders.id_alamat,  nama, detail, provinsi, kota, kecamatan, kodepos, no_telp from orders inner join alamat on orders.id_alamat = alamat.id where orders.id_user = ${iduser}`
  );

  let data = await koneksi.query(
    `SELECT order_detail.id,nama_toko, foto_barang, id_order, order_detail.id_barang, id_varian, order_detail.harga, jumlah, keterangan,  id_user, nama, deskripsi, berat, stok, COALESCE(varian.nama_varian,'-')  as varian
    FROM order_detail
    inner join barang on order_detail.id_barang = barang.id
    inner join orders on order_detail.id_order= orders.id
    LEFT join varian on order_detail.id_varian = varian.id
    inner join merchant on barang.id_merchant = merchant.id
    where orders.id_user = ${iduser} and status= '0'`
  );
  data = groupBy(data, "id_order");
  let keranjang = [];
  orders.forEach((item, index, object) => {
    item["selected"] = true;
    if (data[item.id]) {
      item["orderdetail"] = data[item.id];
      item["nama_toko"] = data[item.id][0]["nama_toko"];
      keranjang.push(item);
    }
  });

  res.status(200).json({
    status: true,
    data: keranjang,
  });
});

const groupBy = (items, key) =>
  items.reduce(
    (result, item) => ({
      ...result,

      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {}
  );

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

router.get("/orders/:id", async function (req, res) {
  let sql = `SELECT order_detail.id,barang.nama, barang.foto_barang , order_detail.harga, order_detail.jumlah, COALESCE(varian.nama_varian,'') as varian, COALESCE(order_detail.keterangan,'') as keterangan from order_detail inner join barang on order_detail.id_barang = barang.id left join varian on varian.id = order_detail.id_varian where order_detail.id_order = $1`;
  let data = await db.query(sql, [req.params.id]);
  res.status(200).json({
    status: true,
    data: data,
  });
});

//Masuk keranjang belum ada order pembayaran
router.post("/", validate(), handlerInput, async function (req, res) {
  let idorder;
  let user = req.body.id_user;

  let sqlAlamat = "SELECT id from alamat where id_user=$1 and flagdefault=1 order by id";
  let dataAlamat = await db.query(sqlAlamat, [user]);
  if (dataAlamat.length == 0) {
    res.status(400).json({
      status: false,
      errorMessage: "Pengguna tidak memiliki alamat pengiriman, silakan menambahkan alamat terlebih dahulu.",
      code: 'NO_ADDRESS'
    });
  } else {
    let merchant = req.body.id_merchant;
    let varian;
    if (req.body.id_varian == undefined) {
      varian = "id_varian is NULL";
    } else {
      varian = "id_varian = " + req.body.id_varian;
    }
    let sqlorderdetail = `select order_detail.id from order_detail inner join orders on orders.id = order_detail.id_order where id_barang ='${req.body.id_barang}' and ${varian} AND status='0'`;

    let detail = await db.query(sqlorderdetail);
    if (detail.length == 0) {
      let sqlorder = `SELECT orders.id FROM order_detail inner join orders on orders.id = order_detail.id_order inner join barang on barang.id = order_detail.id_barang WHERE id_merchant=${merchant} AND id_user=${user} AND status='0'`;
      console.log(sqlorder);
      let order = await db.query(sqlorder);
      if (order.length == 0) {
        let idorder = await db.one(
          "INSERT INTO orders (id_user,status,id_alamat) VALUES ($1,$2,$3) RETURNING ID;",
          [user, "0", dataAlamat[0].id]
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
    } else {
      let sql = `UPDATE public.order_detail	SET  jumlah=jumlah + $1  where id=$2`;
      let data = [req.body.jumlah, detail[0].id];
      koneksi.none(sql, data);
    }

    res.status(200).json({
      status: true,
      data: req.body,
    });
  }
});

//Ubah Keranjang  jumlah dan keterangan dari id
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE order_detail
	SET  jumlah=$1, keterangan=$2
  where id=$3`;
  let data = [req.body.jumlah, req.body.keterangan, id];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

//Ubah Keranjang  jumlah dan keterangan dari id
router.post("/v2", async function (req, res) {
  let dataBody = req.body;
  console.log(dataBody);
  db.tx((t) => {
    const queries = dataBody.map((c) => {
      return t.none(
        `update public.order_detail
      SET  jumlah=$1, keterangan=$2
      where id=$3`,
        [c.jumlah, c.keterangan, c.id]
      );
    });
    return t.batch(queries);
  })
    .then((data) => {
      // success
      res.status(200).json({
        status: true,
        data: req.body,
      });
    })
    .catch((error) => {
      res.status(404).json({
        status: true,
        errorMessage: error,
      });
      // error
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
  }); //
});
module.exports = router;
