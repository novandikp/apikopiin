var express = require("express");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/WishlistValidation");

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT wishlist.id, id_user, id_barang, tgl_wishlist,  id_merchant, id_kategori, nama, deskripsi, harga, berat, stok,  users.username, penjual.username as usermame_penjual, penjual.nama_toko FROM wishlist
    INNER join users on wishlist.id_user = users.id
    INNER join barang on wishlist.id_barang = barang.id
    INNER join users as penjual on wishlist.id_user = penjual.id`
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
    `SELECT wishlist.id, id_user, id_barang, tgl_wishlist,  id_merchant, id_kategori, nama, deskripsi, harga, berat, stok,  users.username, penjual.username as usermame_penjual, penjual.nama_toko FROM wishlist
    INNER join users on wishlist.id_user = users.id
    INNER join barang on wishlist.id_barang = barang.id
    INNER join users as penjual on wishlist.id_user = penjual.id where wishlist.id = $1`,
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

//INSERT
router.post("/", validate(), handlerInput, function (req, res) {
  let sql = `INSERT INTO public.wishlist(
     id_user, id_barang, tgl_wishlist)
    VALUES ( $1, $2, $3)`;
  let data = [req.body.id_user, req.body.id_barang, req.body.tgl_wishlist];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.wishlist
	SET  id_user=$1, id_barang=$2, tgl_wishlist=$3
  where id=$4`;
  let data = [req.body.id_user, req.body.id_barang, req.body.tgl_wishlist, id];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id;
  let sql = `DELETE FROM wishlist WHERE id=$1`;
  let data = [id];
  koneksi.any(sql, data);
  res.status(200).json({
    status: true,
    data: exists[0],
  }); //
});
module.exports = router;
