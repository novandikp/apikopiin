var express = require("express")
const db = require("../Util/Database")
var router = express.Router()
var koneksi = require("../Util/Database")
var multer = require("multer")
const { sendNotification } = require("../Util/Function")

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/image/postingan")
  },

  filename: function (req, file, cb) {
    let ext =
      file.originalname.split(".")[file.originalname.split(".").length - 1]
    let sql = `UPDATE public.postingan SET foto_postingan=$1 where id=$2`
    let data = [req.params.id + "." + ext, req.params.id]
    koneksi.none(sql, data)

    cb(null, req.params.id + "." + ext)
  },
})
var upload = multer({
  storage: storage,
})

//Post Foto postingan
router.post("/foto/:id", upload.single("foto_postingan"), function (req, res) {
  res.json({
    status: true,
    data: { filename: req.file.filename, id: req.params.id },
  })
})

router.post("/like/:id", function (req, res) {
  let sql

  if (req.body.liked == "true") {
    sql = "INSERT INTO likepostingan  (id_postingan,id_user) values ($1,$2)"
  } else {
    sql = "DELETE FROM likepostingan  where id_postingan = $1 and id_user=$2"
  }

  db.none(sql, [req.params.id, req.body.id_user])
    .then(async (data) => {
      if (req.body.liked == "true") {
        let person = "select nama_lengkap from users where id =$1"
        let personData = await koneksi.one(person, [req.body.id_user])
        let likedPerson = `SELECT deviceid,T.nama_lengkap from user_log CROSS JOIN 
        (SELECT postingan.id_user, users.nama_lengkap from postingan inner join users on users.id = postingan.id_user where postingan.id=$1) T
        where user_log.id_user in (SELECT id_user from likepostingan where id_postingan =$1)  and user_log.id_user !=$2`
        let dataLikePerson = await koneksi.query(likedPerson, [
          req.params.id,
          req.body.id_user,
        ])
        if (dataLikePerson.length > 0) {
          sendNotification({
            heading: "Postingan yang anda sukai disukai dengan orang lain",
            content: `${personData.nama_lengkap} juga dari postingan ${dataLikePerson[0]?.nama_lengkap} yang anda suka`,
            player_ids: dataLikePerson.map((item) => item.deviceid),
            additionalData: {
              params: {
                idorder: req.params.id,
              },
              tujuan: "Feed",
            },
          })
        }
      }
      res.status(200).json({
        status: true,
      })
    })
    .catch((e) => {
      res.status(404).json({
        status: false,
        errorMessage: e,
      })
    })
})

router.delete("/:id", function (req, res) {
  let sql = `delete from likepostingan where id_postingan=${req.params.id}; delete from postingan where id=${req.params.id};`
  console.log(sql)
  db.none(sql, [req.params.id])
    .then(() => {
      res.status(200).json({ status: true })
    })
    .catch((e) => {
      res.status(404).json({ status: false })
    })
})

router.post("/", async function (req, res) {
  let sql =
    "INSERT INTO postingan (id_user, id_barang, postingan,tglpostingan) values ($1,$2,$3,now()) RETURNING ID"
  let data = [req.body.id_user, req.body.id_barang, req.body.postingan]
  let result = await db.one(sql, data)
  res.status(200).json({
    status: true,
    id: result.id,
  })
})

router.get("/", async function (req, res) {
  let iduser = "0"

  if (req.query.user) {
    iduser = req.query.user
  }
  let limit = "10"
  let offset = "0"
  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.offset) {
    offset = req.query.offset
  }
  let sql = `SELECT postingan.id, tglpostingan, foto_user, foto_barang, postingan.id_user, id_barang, postingan, foto_postingan, barang.nama, barang.harga, nama_lengkap, COALESCE(T.count,0) as liked, COALESCE(T.count,0) as like from postingan inner join users on users.id = postingan.id_user left join barang on barang.id = postingan.id_barang left join (SELECT count(id) as count,id_postingan from likepostingan where id_user=$1 group by id_postingan) T on T.id_postingan = postingan.id left join (SELECT count(id) as count,id_postingan from likepostingan group by id_postingan) B on B.id_postingan = postingan.id  order by tglpostingan desc,postingan.id desc limit ${limit} offset ${offset}`
  let data = await koneksi.query(sql, [iduser])
  res.status(200).json({
    status: true,
    data: data,
  })
})
module.exports = router
