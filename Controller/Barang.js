var express = require("express");
const { query } = require("../Util/Database");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/BarangValidation");

//GET
router.get("/", async function (req, res) {
  let cari = "";
  if (req.query.cari) {
    cari = req.query.cari;
  }

  let order = "nama";
  if (req.query.orderby) {
    order = req.query.orderby;
    console.log(order);
  }

  let data = await koneksi.query(
    `SELECT barang.id, id_merchant, id_kategori, nama, barang.deskripsi, barang.harga, berat, stok,  nama_toko, jenis_toko,  email, no_telp, jenis_toko.jenis, COALESCE(T.rating,0) as rating from barang  inner join users ON barang.id_merchant = users.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON users.jenis_toko = jenis_toko.id
    LEFT join 
    (SELECT id_barang, avg(rating) as rating from order_detail inner join ulasan  on ulasan.id_order_detail = order_detail.id GROUP by id_barang) T on T.id_barang = barang.id
    where nama ILIKE '%${cari}%' OR 
    deskripsi  ILIKE '%${cari}%' OR
    nama_toko  ILIKE '%${cari}%' ORDER BY ` + order
  );
  res.status(200).json({
    status: true,
    data: data,
  });
});

//Barang by shop
router.get("/shop/:id", async function (req, res) {
  let id = req.params.id;
  let data = await koneksi.query(
    `SELECT barang.id, id_merchant, id_kategori, nama, deskripsi, harga, berat, stok,  nama_toko, jenis_toko,  email, no_telp, jenis_toko.jenis from barang  inner join users ON barang.id_merchant = users.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON users.jenis_toko = jenis_toko.id where id_merchant=$1`,
    [id]
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
    `SELECT barang.id, id_merchant, id_kategori, nama, deskripsi, harga, berat, stok, nama_toko, jenis_toko, email, no_telp, jenis_toko.jenis from barang  inner join users ON barang.id_merchant = users.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON users.jenis_toko = jenis_toko.id where barang.id = $1`,
    [id]
  );
  let varian = await koneksi.query(
    `
  select id, nama_varian  from varian where id_barang = $1
  `,
    [id]
  );

  if (data.length == 1) {
    data[0].varian = varian;
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
router.post("/", validate(), handlerInput, async function (req, res) {
  let sql = `INSERT INTO public.barang(
     id_merchant, id_kategori, nama, deskripsi, harga, berat, stok)
    VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING id`;
  let data = [
    req.body.id_merchant,
    req.body.id_kategori,
    req.body.nama,
    req.body.deskripsi,
    req.body.harga,
    req.body.berat,
    "0",
  ];
  koneksi
    .one(sql, data)
    .then((barang) => {
      let idbarang = barang.id;
      if (req.body.varian != undefined) {
        let varian = req.body.varian;
        varian.map((value) => {
          let sqlvarian = `INSERT INTO public.varian(
          id_barang, nama_varian)
          VALUES ( $1, $2);`;
          let datavarian = [idbarang, value];
          koneksi.none(sqlvarian, datavarian);
        });
      }

      res.status(200).json({
        status: true,
        data: req.body,
      });
    })
    .catch((e) => {
      res.status(406).json({
        status: true,
        errorMessage: e,
      });
    });
});

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.barang
	SET  id_merchant=$1, id_kategori=$2, nama=$3, deskripsi=$4, harga=$5, berat=$6, stok=$7
  where id=$8`;
  let data = [
    req.body.id_merchant,
    req.body.id_kategori,
    req.body.nama,
    req.body.deskripsi,
    req.body.harga,
    req.body.berat,
    req.body.stok,
  ];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id;
  let sql = `DELETE FROM barang WHERE id=$1`;
  let data = [id];
  let exists = await koneksi.any(
    "SELECT id_barang FROM order_detail where id_barang = $1",
    [id]
  );
  let exists2 = await koneksi.any(
    "SELECT id_barang FROM wishlist where id_barang = $1",
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
