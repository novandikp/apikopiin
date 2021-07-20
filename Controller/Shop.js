var express = require("express");
const db = require("../Util/Database");
var router = express.Router();
var koneksi = require("../Util/Database");

//Semua toko
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

  // if (req.query.lat && req.query.long || true) {}
  try {
    data = await koneksi.query(
      `SELECT nama_toko, jenis_toko.jenis ,provinsi, kota, kecamatan,kodepos, alamat_toko, foto_merchant,
      ( 3959 * acos( cos( radians($1) ) * cos( radians( lat_toko) ) * cos( radians( long_toko ) - radians($2) ) + sin( radians($1) ) * sin( radians( lat_toko ) ) ) ) AS distance 
      from merchant inner join jenis_toko on jenis_toko.id = merchant.id_jenis 
        where nama_toko ilike '%${cari}%' or
        alamat_toko ilike '%${cari}%'
        order by distance, ${order}
    
        `,
      [req.query.lat, req.query.long]
    );
  
    res.status(200).json({
      status: true,
      data: data,
    });  
  } catch (e) {
    res.status(500).json({
      status: false,
      data: data,
      errorMessage: e.message
    });
  }
  
});

//Detail toko
router.get("/:id", async function (req, res) {
  // console.log(req.query)
  let id = req.params.id;
  let sql = `SELECT nama_toko,foto_merchant, id_jenis as jenis_toko, idprovinsi, idkota, jenis_toko.jenis, provinsi,
  kota, kecamatan,kodepos , alamat_toko,lat_toko, long_toko,alamat_map 
  from merchant inner join jenis_toko on jenis_toko.id = merchant.id_jenis where merchant.id = ${id}`;
  let data = await db.one(sql);
  res.status(200).send({
    status: true,
    data: data,
  });
});

module.exports = router;
