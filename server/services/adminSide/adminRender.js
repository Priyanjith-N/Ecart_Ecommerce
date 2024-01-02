const axios = require("axios");
const adminHelper = require('../../databaseHelpers/adminHelper')

module.exports = {
  adminLogin: (req, res) => {
    res.render(
      "adminSide/adminLogin",
      { invalid: req.session.invalidAdmin, adminErr:{
        adminEmail: req.session.adminEmail,
        adminPassword: req.session.adminPassword
      } },
      (err, html) => {
        if (err) {
          console.error("Error rendering view:", err);
          return res.status(500).send("Internal Server Error");
        }

        delete req.session.invalidAdmin;
        delete req.session.adminPassword;
        delete req.session.adminEmail;

        res.send(html);
      }
    );
  },
  adminHome: async (req, res) => {
    try {
      const dashDetails = await axios.get(
        `http://localhost:${process.env.PORT}/api/userCount`
      );

      res.status(200).render("adminSide/adminDashboard", {
        dashBoard: dashDetails.data,
      });
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminAddProducts: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res.status(200).render(
        "adminSide/adminAddProduct",
        {
          category: category.data,
          errMesg: {
            pName: req.session.pName,
            sTittle: req.session.subTittle,
            dHead: req.session.dheading,
            pDes: req.session.pDescription,
            fPrice: req.session.fPrice,
            lPrice: req.session.lPrice,
            discount: req.session.discount,
            color: req.session.color,
            qty: req.session.quantity,
            file: req.session.files,
          },
          savedDetails: req.session.productInfo,
        },
        (err, html) => {
          if (err) {
            console.error("Error rendering view:", err);
            return res.status(500).send("Internal Server Error");
          }

          delete req.session.pName;
          delete req.session.subTittle;
          delete req.session.dheading;
          delete req.session.pDescription;
          delete req.session.fPrice;
          delete req.session.lPrice;
          delete req.session.discount;
          delete req.session.color;
          delete req.session.quantity;
          delete req.session.files;
          delete req.session.productInfo;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminProductManagement: async (req, res) => {
    try {
      const products = await axios.get(
        `http://localhost:${process.env.PORT}/api/getProductList/1`
      );

      res.status(200).render(
        "adminSide/adminProductManagement",
        {
          products: products.data,
        },
        (err, html) => {
          if (err) {
            console.error("Error rendering view:", err);
            return res.status(500).send("Internal Server Error");
          }

          delete req.session.productInfo;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminAddCategory: (req, res) => {
    res
      .status(200)
      .render(
        "adminSide/adminAddCategory",
        { err: req.session.errMesg },
        (err, html) => {
          if (err) {
            console.log("render Err", err);
            return res.status(500).send("Internal Server err");
          }

          delete req.session.errMesg;

          res.send(html);
        }
      );
  },
  adminCategoryManagement: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1?Search=${req.query.Search?req.query.Search:''}`
      );
      res.render("adminSide/adminCategoryManagement", {
        category: category.data,
        filterCat: req.query.Search,
      });
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminUnlistedCategory: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/0?Search=${req.query.Search?req.query.Search:''}`
      );
      res
        .status(200)
        .render("adminSide/adminUnlistedCategory", { filterCat: req.query.Search, category: category.data });
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminUnlistedProduct: async (req, res) => {
    try {

      const products = await axios.get(
        `http://localhost:${process.env.PORT}/api/getProductList/0`
      );

      res.status(200).render("adminSide/adminUnlistedProduct", {
        products: products.data,
      });
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminUpdateProduct: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );

      const product = await axios.get(
        `http://localhost:${process.env.PORT}/api/getProduct/${req.params.id}`
      );
      console.log(req.params.id);
      res.status(200).render(
        "adminSide/adminUpdateProduct",
        {
          category: category.data,
          product: product.data,
          savedDetails: req.session.updateProductInfo,
          errMesg: {
            pName: req.session.pName,
            sTittle: req.session.subTittle,
            dHead: req.session.dheading,
            pDes: req.session.pDescription,
            fPrice: req.session.fPrice,
            lPrice: req.session.lPrice,
            discount: req.session.discount,
            color: req.session.color,
            qty: req.session.quantity,
            file: req.session.files,
          }
        },
        (err, html) => {
          if (err) {
            console.error("Error rendering view:", err);
            return res.status(500).send("Internal Server Error");
          }

          delete req.session.pName;
          delete req.session.subTittle;
          delete req.session.dheading;
          delete req.session.pDescription;
          delete req.session.fPrice;
          delete req.session.lPrice;
          delete req.session.discount;
          delete req.session.color;
          delete req.session.quantity;
          delete req.session.files;
          delete req.session.updateProductInfo;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminUserManagement: async(req, res) => {
    const users = await axios.post(`http://localhost:${process.env.PORT}/api/getAllUser?Search=${req.query.Search?req.query.Search:''}`);
    res.status(200).render('adminSide/adminUserManagement', {users: users.data, filter: req.query.Search});
  },
  adminOrderManagement: async (req, res) => {
    try {
      const orders = await axios.post(`http://localhost:${process.env.PORT}/api/getAllcartItemsWithFilter?filter=${req.query.filter}`);
      res.status(200).render("adminSide/adminOrderManagement", {orders: orders.data, filter: req.query.filter});
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminBannerManagement: async (req, res) => {
    try {
      const banner = await adminHelper.getBanner(true);
      res.status(200).render('adminSide/adminBannerManagement', {banner});
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminAddBanner: async (req, res) => {
    try {
      const category = await adminHelper.getCategorydb(true);
      res.status(200).render('adminSide/adminAddBanner', {
        errMesg: {
          bName: req.session.bName,
          bDescription: req.session.bDescription,
          category: req.session.category,
          largeImg: req.session.largeImg,
          smallImg: req.session.smallImg,
        },
        savedInfo: req.session.savedInfo,
        category
      }, (err, html) => {
        if(err) {
          return res.status(500).send('Internal server err');
        }

        delete req.session.bName;
        delete req.session.bDescription;
        delete req.session.category;
        delete req.session.largeImg;
        delete req.session.smallImg;
        delete req.session.savedInfo;

        res.status(200).send(html);
      });
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
  adminUnlistedBannerManagement: async (req, res) => {
    try {
      const banner = await adminHelper.getBanner(false);
      res.status(200).render('adminSide/adminUnlistedBanner', {banner});
    } catch (err) {
      console.log("err", err);
      res.send("Internal server err");
    }
  },
};
