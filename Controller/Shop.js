var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");

//ambil toko
router.get("/", async function (req, res) {
  let data = [];
  let cari = "";
  if (req.query.cari) {
    cari = req.query.cari;
  }

  let order = "nama_toko";
  if (req.query.orderby) {
    order = req.query.orderby;
  }

  if (req.query.lat && req.query.long) {
    data = await koneksi.query(
      `SELECT nama_toko, jenis_toko.jenis , alamat_toko, lat_toko, long_toko ,
        ( 3959 * acos( cos( radians($1) ) * cos( radians( lat_toko) ) * cos( radians( long_toko ) - radians($2) ) + sin( radians($1) ) * sin( radians( lat_toko ) ) ) ) AS distance 
        from users inner join jenis_toko on jenis_toko.id = users.jenis_toko 
        where nama_toko like '%${cari}%' or
        alamat_toko like '%${cari}%'
        order by distance, ${order}
    
        `,
      [req.query.lat, req.query.long]
    );
  } else {
    data = await koneksi.query(
      `SELECT nama_toko, jenis_toko.jenis , alamat_toko, lat_toko, long_toko 
         from users inner join jenis_toko on jenis_toko.id = users.jenis_toko 
        where nama_toko like '%${cari}%' or
        alamat_toko like '%${cari}%'
        order by  ${order}
          `
    );
  }

  res.status(200).json({
    status: true,
    data: data,
  });
});

module.exports = router;