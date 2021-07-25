var express = require("express");
const db = require("../Util/Database");
var router = express.Router();
var koneksi = require("../Util/Database");
var multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/image/postingan");
  },

  filename: function (req, file, cb) {
    let ext =
      file.originalname.split(".")[file.originalname.split(".").length - 1];
    let sql = `UPDATE public.postingan SET foto_postingan=$1 where id=$2`;
    let data = [req.params.id + "." + ext, req.params.id];
    koneksi.none(sql, data);

    cb(null, req.params.id + "." + ext);
  },
});
var upload = multer({
  storage: storage,
});

//Post Foto postingan
router.post("/foto/:id", upload.single("foto_postingan"), function (req, res) {
  res.json({
    status: true,
    data: { filename: req.file.filename, id: req.params.id },
  });
});

router.post("/like/:id", function (req, res) {
  let sql =
    "INSERT INTO likepostingan  (id_postingan,id_user) values ($1,$2) RETURNING ID";
  db.one(sql, [req.params.id, req.body.id_user])
    .then((data) => {
      res.status(200).json({
        status: true,
        id: data.id,
      });
    })
    .catch((e) => {
      res.status(404).json({
        status: false,
        errorMessage: e,
      });
    });
});

router.post("/", async function (req, res) {
  let sql =
    "INSERT INTO postingan (id_user, id_barang, postingan,tglpostingan) values ($1,$2,$3,now()) RETURNING ID";
  let data = [req.body.id_user, req.body.id_barang, req.body.postingan];
  let result = await db.one(sql, data);
  res.status(200).json({
    status: true,
    id: result.id,
  });
});

router.get("/", async function (req, res) {
  let iduser = "0";

  if (req.query.user) {
    iduser = req.query.user;
  }
  let limit = "10";
  let offset = "0";
  if (req.query.limit) {
    limit = req.query.limit;
  }
  if (req.query.offset) {
    offset = req.query.offset;
  }
  let sql = `SELECT postingan.id, foto_user, foto_barang, postingan.id_user, id_barang, postingan, foto_postingan, barang.nama, barang.harga, nama_lengkap, COALESCE(T.count,0) as liked, COALESCE(T.count,0) as like from postingan inner join users on users.id = postingan.id_user left join barang on barang.id = postingan.id_barang left join (SELECT count(id) as count,id_postingan from likepostingan where id_user=$1 group by id_postingan) T on T.id_postingan = postingan.id left join (SELECT count(id) as count,id_postingan from likepostingan group by id_postingan) B on B.id_postingan = postingan.id  limit ${limit} offset ${offset}`;
  let data = await koneksi.query(sql, [iduser]);
  res.status(200).json({
    status: true,
    data: data,
  });
});
module.exports = router;
