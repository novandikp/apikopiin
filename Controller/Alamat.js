var express = require("express")
var router = express.Router()
var koneksi = require("../Util/Database")
const handlerInput = require("../Util/ValidationHandler")
const validate = require("../Validation/AlamatValidation")

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT alamat.id, id_user, nama, detail, provinsi, kota, kecamatan, kodepos, alamat.no_telp, latitude, longitude,  username, nama_lengkap, email from alamat 
    INNER join users on alamat.id_user = users.id`
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

//GET BY ID
router.get("/:id", async function (req, res, next) {
  let id = req.params.id

  let data = await koneksi.query(
    `SELECT alamat.id, alamat_map,idprovinsi,idkota, id_user, nama, detail, provinsi, kota, kecamatan, kodepos, alamat.no_telp, latitude, longitude,  username, nama_lengkap, email from alamat 
    INNER join users on alamat.id_user = users.id where alamat.id = $1`,
    [id]
  )
  if (data.length == 1) {
    res.status(200).json({
      status: true,
      data: data[0],
    })
  } else {
    res.status(204).json({
      status: false,
      data: [],
    })
  }
})

router.get("/user/:id", async function (req, res, next) {
  let id = req.params.id
  let cari = ""
  if (req.query.cari) {
    cari = req.query.cari
  }
  let data = await koneksi.query(
    `SELECT alamat.id, id_user, nama, detail, provinsi, kota, kecamatan, kodepos, alamat.no_telp, latitude, longitude,  username,
    nama_lengkap, email, flagdefault from alamat 
      INNER join users on alamat.id_user = users.id where alamat.id_user = $1 AND 
      (nama ILIKE '%${cari}%' OR detail ILIKE '%${cari}%' OR alamat.no_telp ILIKE '%${cari}%') order by flagdefault desc`,
    [id]
  )

  res.status(200).json({
    status: true,
    data: data,
  })
})

//INSERT
router.post("/", validate(), handlerInput, async function (req, res) {
  let sql = `SELECT id from alamat where id_user = $1`
  let dataAlamat = await koneksi.query(sql, [req.body.id_user])

  let flagdefault
  if (dataAlamat.length) {
    flagdefault = 0
  } else {
    flagdefault = 1
  }

  sql = `INSERT INTO public.alamat(
    id_user, nama, detail, provinsi, kota, kecamatan, kodepos, no_telp, latitude, longitude, idprovinsi, idkota, alamat_map, flagdefault)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`
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
    req.body.idprovinsi,
    req.body.idkota,
    req.body.alamat_map,
    flagdefault,
  ]

  koneksi
    .none(sql, data)
    .then((data) => {
      res.status(200).json({
        status: true,
        data: req.body,
      })
    })
    .catch((e) => {
      res.status(500).json({
        status: false,
        data: req.body,
        errorMessage: e.error,
      })
    })
})

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id
  let sql = `UPDATE public.alamat
	SET  id_user=$1, nama=$2, detail=$3, provinsi=$4, kota=$5, kecamatan=$6, kodepos=$7, no_telp=$8, latitude=$9, longitude=$10, idprovinsi = $11, idkota =$12,  alamat_map=$13 where id=$14`
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
    req.body.idprovinsi,
    req.body.idkota,
    req.body.alamat_map,
    id,
  ]
  koneksi.none(sql, data)
  res.status(200).json({
    status: true,
    data: req.body,
  })
})

// Set alamat default
router.put("/default/:id", validate(), handlerInput, async function (req, res) {
  try {
    await koneksi.none(
      "UPDATE public.alamat set flagdefault=0 where id_user=$1",
      [req.body.id_user]
    )
    await koneksi.none(`UPDATE public.alamat set flagdefault=1 where id=$1`, [
      req.params.id,
    ])
    res.status(200).json({
      status: true,
      data: req.body,
    })
  } catch (e) {
    res.status(500).json({
      status: false,
      data: req.body,
      errorMessage: e.error,
    })
  }
})

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id
  let sql = `DELETE FROM alamat WHERE id=$1`
  let data = [id]
  koneksi.any(sql, data)
  res.status(200).json({
    status: true,
  })
  //
})
module.exports = router
