var express = require("express")
var router = express.Router()
var koneksi = require("../Util/Database")

//ambil toko
router.get("/shop", async function (req, res) {
  let data = []

  // if (req.query.lat && req.query.long || true) {}
  try {
    data = await koneksi.query(
      `SELECT merchant.id,nama_toko, foto_merchant, jenis_toko.jenis , alamat_toko, kota,
        ( 3959 * acos( cos( radians($1) ) * cos( radians( lat_toko) ) * cos( radians( long_toko ) - radians($2) ) + sin( radians($1) ) * sin( radians( lat_toko ) ) ) ) AS distance 
        from merchant inner join jenis_toko on jenis_toko.id = merchant.id_jenis 
        order by distance
        limit 10 
        `,
      [req.query.lat, req.query.long]
    )

    res.status(200).json({
      status: true,
      data: data,
    })
  } catch (e) {
    res.status(500).json({
      status: false,
      data: data,
      errorMessage: e.message,
    })
  }
})

router.get("/product", async function (req, res) {
  let data = await koneksi.query(
    `SELECT barang.id, foto_barang, id_merchant, id_kategori, nama, deskripsi, harga, berat, stok,  nama_toko, alamat_toko, jenis_toko.jenis,
    merchant.kota
    from barang  inner join merchant ON barang.id_merchant = merchant.id
    inner join kategori ON barang.id_kategori = kategori.id
    inner join jenis_toko ON merchant.id_jenis = jenis_toko.id limit 12`
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

module.exports = router
