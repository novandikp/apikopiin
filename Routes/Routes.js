const User = require("../Controller/User");
const Jenis = require("../Controller/Jenis");
const Alamat = require("../Controller/Alamat");
const Barang = require("../Controller/Barang");
const Kategori = require("../Controller/Kategori");
const Order = require("../Controller/Order");
const Ulasan = require("../Controller/Ulasan");
const Varian = require("../Controller/Varian");
const Wishlist = require("../Controller/Wishlist");
const OrderDetail = require("../Controller/OrderDetail");
const Auth = require("../Controller/Auth");
const Dashboard = require("../Controller/Dashboard");

function Route(app) {
  app.use("/user", User);
  app.use("/jenis", Jenis);
  app.use("/alamat", Alamat);
  app.use("/barang", Barang);
  app.use("/kategori", Kategori);
  app.use("/ulasan", Ulasan);
  app.use("/order", Order);
  app.use("/orderdetail", OrderDetail);
  app.use("/varian", Varian);
  app.use("/wishlist", Wishlist);
  app.use("/auth", Auth);
  app.use("/dashboard", Dashboard);
}

module.exports = Route;
