var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");

//ambil toko
router.get("/shop", async function (req, res) {
  let data = [];
  if (req.query.lat && req.query.long) {
    data = await koneksi.query(
      `SELECT nama_toko, jenis_toko.jenis , alamat_toko, lat_toko, long_toko ,
        ( 3959 * acos( cos( radians($1) ) * cos( radians( lat_toko) ) * cos( radians( long_toko ) - radians($2) ) + sin( radians($1) ) * sin( radians( lat_toko ) ) ) ) AS distance 
        from users inner join jenis_toko on jenis_toko.id = users.jenis_toko 
        order by distance
        limit 10 
        `,
      [req.query.lat, req.query.long]
    );
  } else {
    data = await koneksi.query(
      `SELECT nama_toko, jenis_toko.jenis , alamat_toko, lat_toko, long_toko 
          from users inner join jenis_toko on jenis_toko.id = users.jenis_toko 
          limit 10 
          `
    );
  }

  res.status(200).json({
    status: true,
    data: data,
  });
});

router.get("/product", async function (req, res) {
  let data = await koneksi.query(
    `SELECT barang.id, id_merchant, id_kategori, nama, deskripsi, harga, berat, stok, username, nama_lengkap, nama_toko, jenis_toko,  email, no_telp, jenis_toko.jenis from barang  inner join users ON barang.id_merchant = users.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON users.jenis_toko = jenis_toko.id limit 5`
  );
  res.status(200).json({
    status: true,
    data: data,
  });
});

module.exports = router;
