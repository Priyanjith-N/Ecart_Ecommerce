const axios = require("axios");
const userHelper = require('../../databaseHelpers/userHelper');

module.exports = {
  homePage: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );

      const products = await axios.post(
        `http://localhost:${process.env.PORT}/api/newlyLauched`
      );

      res.status(200).render("userSide/userHome", {
        category: category.data,
        newProducts: products.data,
        toast: req.flash('toastMessage'),
      });
    } catch (err) {
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userLogin: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res.status(200).render(
        "userSide/userLogin",
        {
          invalid: req.session.invalidUser,
          isBlock: req.session.userBlockedMesg,
          errMesg: {
            email: req.session.email,
            password: req.session.password,
            userInfo: req.session.userInfo,
          },
          category: category.data,
        },
        (err, html) => {
          // Handle errors during rendering
          if (err) {
            console.error("Error rendering view:", err);
            return res.status(500).send("Internal Server Error");
          }

          // Delete the invalidUser property from the session after rendering the EJS file
          delete req.session.invalidUser;
          delete req.session.userId;
          delete req.session.verifyEmail;
          delete req.session.userBlockedMesg;
          delete req.session.email;
          delete req.session.password;
          delete req.session.userInfo;

          // Send the rendered HTML to the client
          res.send(html);
        }
      );
    } catch (err) {
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userEmailVerify: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res
        .status(200)
        .render(
          "userSide/registerEmailVerify",
          { isUser: req.session.isUser, category: category.data },
          (err, html) => {
            if (err) {
              console.log(err);
              return res.status(500).send("Internal Server Error");
            }

            delete req.session.isUser;

            res.send(html);
          }
        );
    } catch (err) {
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userRegisterOtpVerify: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res.status(200).render(
        "userSide/registerOtpVerify",
        {
          email: req.session.verifyEmail,
          errorMesg: req.session.otpError,
          rTime: req.session.rTime,
          category: category.data,
        },
        (err, html) => {
          if (err) {
            return res.status(500).send("Internal Error");
          }

          delete req.session.otpError;
          delete req.session.rTime;

          res.send(html);
        }
      );
    } catch (err) {
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userRegister: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res.status(200).render(
        "userSide/userRegister",
        {
          userInfo: req.session.userRegister,
          errMesg: {
            fName: req.session.fName,
            phone: req.session.phone,
            pass: req.session.pass,
            conPass: req.session.conPass,
            bothPass: req.session.bothPass,
            email: req.session.email,
          },
          category: category.data,
        },
        (err, html) => {
          if (err) {
            console.log("Register Page render Err:", err);
            return res.status(500).send("Internal Error");
          }

          delete req.session.userRegister;
          delete req.session.fName;
          delete req.session.phone;
          delete req.session.pass;
          delete req.session.conPass;
          delete req.session.bothPass;
          delete req.session.verifyOtpPage;
          delete req.session.email;

          res.status(200).send(html);
        }
      );
    } catch (err) {
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userForgotPassword: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res.status(200).render(
        "userSide/userLoginForgotPassword",
        {
          errorMesg: req.session.emailError,
          otpErr: req.session.otpError,
          email: req.session.verifyEmail,
          rTime: req.session.rTime,
          category: category.data,
        },
        (err, html) => {
          if (err) {
            console.log("Register Page render Err:", err);
            return res.status(500).send("Internal Error");
          }

          delete req.session.emailError;
          delete req.session.otpError;
          delete req.session.rTime;

          res.status(200).send(html);
        }
      );
    } catch (err) {
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userResetPassword: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res.status(200).render(
        "userSide/userLoginResetPassword",
        {
          error: {
            comErr: req.session.errMesg,
            newPass: req.session.newPass,
            conPass: req.session.conPass,
          },
          category: category.data,
        },
        (err, html) => {
          if (err) {
            console.log("UserResetPass err", err);
            return res.status(500).send("Internal Server Error");
          }

          delete req.session.errMesg;
          delete req.session.newPass;
          delete req.session.conPass;

          res.status(200).send(html);
        }
      );
    } catch (err) {
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  showProductsCategory: async (req, res) => {
    try {
      const wishListProducts = await userHelper.getWishlistItems(req.session.isUserAuth);
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const products = await axios.post(
        `http://localhost:${process.env.PORT}/api/userCategory/${req.params.category}`
      );

      res.status(200).render("userSide/userSingleCategoryProducts", {
        products: products.data,
        category: category.data,
        wishListProducts
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userProductDetails: async (req, res) => {
    try {
      const wishListProducts = await userHelper.getWishlistItems(req.session.isUserAuth);
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const product = await axios.post(
        `http://localhost:${process.env.PORT}/api/getproduct/${req.params.id}`
      );
      const [singleProduct] = product.data;
      const isCartItem = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCartItems/${req.params.id}/${req.session.isUserAuth}`
      );
      res.status(200).render("userSide/userProductDetails", {
        products: singleProduct,
        category: category.data,
        isCartItem: isCartItem.data,
        wishListProducts
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  usersAddToCart: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const cartItems = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCartAllItem/${req.session.isUserAuth}`
      );
      res.status(200).render(
        "userSide/userAddCart",
        {
          category: category.data,
          cartItems: cartItems.data,
          cartErr: req.session.cartErr,
        },
        (err, html) => {
          if (err) {
            return res.send("renderErr");
          }

          delete req.session.cartErr;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userProfile: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const user = await axios.post(
        `http://localhost:${process.env.PORT}/api/userInfo/${req.session.isUserAuth}`
      );
      res.status(200).render("userSide/userProfile", {
        category: category.data,
        user: user.data,
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userUpdateAccount: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const user = await axios.post(
        `http://localhost:${process.env.PORT}/api/userInfo/${req.session.isUserAuth}`
      );
      res.status(200).render(
        "userSide/userUpdateAccount",
        {
          category: category.data,
          sInfo: req.session.savedInfo,
          user: user.data,
          errMesg: {
            fName: req.session.fName,
            email: req.session.email,
            phone: req.session.phone,
            oldPass: req.session.oldPass,
            password: req.session.password,
            cPass: req.session.cPass,
          },
        },
        (err, html) => {
          if (err) {
            console.log("Render err update ac");
            return res.send("Internal server err");
          }

          delete req.session.savedInfo;
          delete req.session.fName;
          delete req.session.email;
          delete req.session.phone;
          delete req.session.oldPass;
          delete req.session.password;
          delete req.session.cPass;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userEditAddress: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const user = await axios.post(
        `http://localhost:${process.env.PORT}/api/userInfo/${req.session.isUserAuth}`
      );
      res.status(200).render("userSide/editAddress", {
        category: category.data,
        userInfo: user.data,
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  addAddress: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const user = await axios.post(
        `http://localhost:${process.env.PORT}/api/userInfo/${req.session.isUserAuth}`
      );
      res.status(200).render(
        "userSide/addAddress",
        {
          category: category.data,
          sInfo: req.session.sAddress,
          errMesg: {
            locality: req.session.locality,
            country: req.session.country,
            district: req.session.district,
            state: req.session.state,
            city: req.session.city,
            hNo: req.session.hNo,
            hName: req.session.hName,
            pin: req.session.pin,
            exist: req.session.exist
          },
        },
        (err, html) => {
          if (err) {
            console.log("Render err update ac");
            return res.send("Internal server err");
          }

          delete req.session.locality;
          delete req.session.country;
          delete req.session.district;
          delete req.session.state;
          delete req.session.city;
          delete req.session.hNo;
          delete req.session.hName;
          delete req.session.pin;
          delete req.session.sAddress;
          delete req.session.exist;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  updateAddress: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const address = await axios.post(
        `http://localhost:${process.env.PORT}/api/getAddress/${req.params.adId}`
      );
      console.log(address.data);

      res.status(200).render(
        "userSide/updateAddress",
        {
          category: category.data,
          sInfo: req.session.sAddress,
          address: address.data,
          errMesg: {
            locality: req.session.locality,
            country: req.session.country,
            district: req.session.district,
            state: req.session.state,
            city: req.session.city,
            hNo: req.session.hNo,
            hName: req.session.hName,
            pin: req.session.pin,
            exist: req.session.exist,
          },
        },
        (err, html) => {
          if (err) {
            console.log("Render err update ac");
            return res.send("Internal server err");
          }

          delete req.session.locality;
          delete req.session.country;
          delete req.session.district;
          delete req.session.state;
          delete req.session.city;
          delete req.session.hNo;
          delete req.session.hName;
          delete req.session.pin;
          delete req.session.exist;
          delete req.session.sAddress;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userBuyNow: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const product = await axios.post(
        `http://localhost:${process.env.PORT}/api/getproduct/${req.params.productId}`
      );
      const [singleProduct] = product.data;
      res.status(200).render(
        "userSide/userBuyNow",
        {
          category: category.data,
          product: singleProduct,
          errMesg: req.session.avalQty,
          savedQty: req.session.savedQty,
        },
        (err, html) => {
          if (err) {
            return res.send("Render err");
          }

          delete req.session.avalQty;
          delete req.session.savedQty;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userBuyNowCheckOut: async (req, res) => {
    try {
      if (!req.session.buyNowPro && Object.keys(req.query).length === 0) {
        return res.redirect("/");
      }
      let product;
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const user = await axios.post(
        `http://localhost:${process.env.PORT}/api/userInfo/${req.session.isUserAuth}`
      );
      if (req.query.payFrom === "cart") {
        req.session.isCartItem = true;
        product = await axios.post(
          `http://localhost:${process.env.PORT}/api/getCartAllItem/${req.session.isUserAuth}`
        );
        product = product.data;
      } else {
        delete req.session.isCartItem;
        product = await axios.post(
          `http://localhost:${process.env.PORT}/api/getproduct/${req.session.buyNowPro.pId}`
        );
        product = product.data[0];
      }

      res.status(200).render(
        "userSide/userPayment",
        {
          category: category.data,
          product: product,
          buyNowPro: req.session.buyNowPro,
          user: user.data,
          errMesg: req.session.payErr,
          adErrMesg: req.session.adErr,
          cartPro: req.session.isCartItem,
        },
        (err, html) => {
          if (err) {
            console.log("payRender err", err);
            return res.send("Internal server err");
          }

          delete req.session.payErr;
          delete req.session.adErr;

          res.send(html);
        }
      );
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userOrderSuccessfull: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      res
        .status(200)
        .render(
          "userSide/orderPlacedSuccessfull",
          { category: category.data },
          (err, html) => {
            if (err) {
              console.log("successRender err");
              return res.send("Internal server err");
            }

            delete req.session.orderSucessPage;
            delete req.session.buyNowPro;

            res.send(html);
          }
        );
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userOrders: async (req, res) => {
    try {
      const category = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCategory/1`
      );
      const orderItems = await axios.post(
        `http://localhost:${process.env.PORT}/api/getAllOrder/${req.session.isUserAuth}`
      );
      res.status(200).render("userSide/userOrderPage", {
        category: category.data,
        orders: orderItems.data,
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
};
