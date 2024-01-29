const userHelper = require('../../databaseHelpers/userHelper');
const adminHelper = require('../../databaseHelpers/adminHelper');

module.exports = {
  homePage: async (req, res) => {
    try {
      //userHelper fn to get listed banner
      const banner = await adminHelper.getBanner(true);

      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get newly launched products in home 
      const products = await userHelper.getProductDetails(null, true);

      res.status(200).render("userSide/userHome", {
        category,
        newProducts: products,
        toast: req.flash('toastMessage'),
        banner,
        counts
      });
    } catch (err) {
      console.error(err, 'Home page err');
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userLogin: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

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
          category,
          counts
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
      console.error('user side err', err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userEmailVerify: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      res
        .status(200)
        .render(
          "userSide/registerEmailVerify",
          { isUser: req.session.isUser, category, counts},
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      res.status(200).render(
        "userSide/registerOtpVerify",
        {
          email: req.session.verifyEmail,
          errorMesg: req.session.otpError,
          rTime: req.session.rTime,
          category,
          counts
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to check if there is referral code or if its valid
      const isReffered = await userHelper.userRegisterWithOrWithoutRefferal(req.query);

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
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
          category,
          counts,
          isReffered
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      res.status(200).render(
        "userSide/userLoginForgotPassword",
        {
          errorMesg: req.session.emailError,
          otpErr: req.session.otpError,
          email: req.session.verifyEmail,
          rTime: req.session.rTime,
          category,
          counts
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      res.status(200).render(
        "userSide/userLoginResetPassword",
        {
          error: {
            comErr: req.session.errMesg,
            newPass: req.session.newPass,
            conPass: req.session.conPass,
          },
          category,
          counts
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get product details of specific category
      const products = await userHelper.userSingleProductCategory(req.params.category, req.query);

      //userHelper fn to get total number of products
      const totalProducts = await userHelper.userTotalProductNumber(req.params.category);

      res.status(200).render("userSide/userSingleCategoryProducts", {
        products,
        category,
        wishListProducts,
        counts,
        curentPage: Number(req.query.page),
        totalProducts,
        currentCategory: req.params.category
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userProductDetails: async (req, res) => {
    try {
      const wishListProducts = await userHelper.getWishlistItems(req.session.isUserAuth);
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get details of single product in single product detail page
      const [singleProduct] = await userHelper.getProductDetails(req.params.id);

      if(!singleProduct) {
        return res.status(401).redirect('/');
      }

      //userHelper function to cheack if the product already exists in user cart
      const isCartItem = await userHelper.isProductCartItem(req.params.id, req.session.isUserAuth);
      
      res.status(200).render("userSide/userProductDetails", {
        products: singleProduct,
        category,
        isCartItem,
        wishListProducts,
        message: req.flash('message'),
        counts
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  usersAddToCart: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //user Helper fn to get product all product in cart
      const cartItems = await userHelper.getCartItemsAll(req.session.isUserAuth);
      res.status(200).render(
        "userSide/userAddCart",
        {
          category,
          cartItems,
          cartErr: req.session.cartErr,
          counts
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      //userHelper fn to get all details of user
      const [user] = await userHelper.getUserInfo(req.session.isUserAuth);

      // adminHelper fn to get referral offer
      const referralOffer = await adminHelper.referralOffers();

      const HOSTED = process.env.HOSTED_DOMAIN || `http://localhost:${process.env.PORT}`;

      res.status(200).render("userSide/userProfile", {
        category,
        user,
        counts,
        referralOffer,
        HOSTED
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userUpdateAccount: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      //userHelper fn to get all details of user
      const [user] = await userHelper.getUserInfo(req.session.isUserAuth);
      res.status(200).render(
        "userSide/userUpdateAccount",
        {
          category,
          sInfo: req.session.savedInfo,
          user,
          errMesg: {
            fName: req.session.fName,
            email: req.session.email,
            phone: req.session.phone,
            oldPass: req.session.oldPass,
            password: req.session.password,
            cPass: req.session.cPass,
          },
          counts
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      //userHelper fn to get all details of user
      const [user] = await userHelper.getUserInfo(req.session.isUserAuth);
      res.status(200).render("userSide/editAddress", {
        category,
        userInfo: user,
        counts
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  addAddress: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      res.status(200).render(
        "userSide/addAddress",
        {
          category,
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
          counts
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get a single address for updating
      const address = await userHelper.getSingleAddress(req.session.isUserAuth, req.params.adId);

      res.status(200).render(
        "userSide/updateAddress",
        {
          category,
          sInfo: req.session.sAddress,
          address,
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
          counts
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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get details of single product in buy now page
      const [singleProduct] = await userHelper.getProductDetails(req.params.productId);

      if(!singleProduct) {
        return res.status(401).redirect('/');
      }
      res.status(200).render(
        "userSide/userBuyNow",
        {
          category,
          product: singleProduct,
          errMesg: req.session.avalQty,
          savedQty: req.session.savedQty,
          counts,
          coupon: req.session.coupon
        },
        (err, html) => {
          if (err) {
            return res.send("Render err");
          }

          delete req.session.avalQty;
          delete req.session.savedQty;
          delete req.session.coupon;

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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      //userHelper fn to get all details of user
      const [user] = await userHelper.getUserInfo(req.session.isUserAuth);
      if (req.query.payFrom === "cart") {
        req.session.isCartItem = true;

        //user Helper fn to get product all product in cart
        product = await userHelper.getCartItemsAll(req.session.isUserAuth);
        if(req.session.cartCouponId){
          const coupon = await userHelper.getCoupon(null, req.session.cartCouponId);
          const total = product.reduce((total, value) => {
            if(coupon && ((coupon?.category === 'All') || (coupon?.category === value.pDetails[0].category))){
              return total += Math.round(value.pDetails[0].lPrice * value.products.quandity * coupon.discount / 100);
            }
            return total;
          }, 0);

          req.session.cDetails = {
            cDiscount: total,
            _id: coupon._id
          }
        }
      } else {
        delete req.session.isCartItem;

        //userHelper fn to get details of single product in payment page
        product = await userHelper.getProductDetails(req.session.buyNowPro.pId);
        product = product[0];
        const coupon = await userHelper.getCoupon(null, req.session.buyNowPro.couponId);
        if(coupon){
          req.session.cDetails = {
            cDiscount: Math.round(product.lPrice * req.session.buyNowPro.qty * (coupon.discount / 100)),
            _id: coupon._id
          }
        }
      }

      res.status(200).render(
        "userSide/userPayment",
        {
          category,
          product: product,
          buyNowPro: req.session.buyNowPro,
          user,
          errMesg: req.session.payErr,
          adErrMesg: req.session.adErr,
          cartPro: req.session.isCartItem,
          counts,
          cDetails: req.session.cDetails,
        },
        (err, html) => {
          if (err) {
            console.log("payRender err", err);
            return res.send("Internal server err");
          }

          delete req.session.payErr;
          delete req.session.adErr;
          delete req.session.cDetails;

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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      res
        .status(200)
        .render(
          "userSide/orderPlacedSuccessfull",
          { category, counts },
          (err, html) => {
            if (err) {
              console.log("successRender err");
              return res.send("Internal server err");
            }

            delete req.session.orderSucessPage;
            delete req.session.buyNowPro;
            delete req.session.cartCouponId;

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
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get all order history
      const orderItems = await userHelper.userGetAllOrder(req.session.isUserAuth, req.query.page);
      res.status(200).render("userSide/userOrderPage", {
        category,
        orders: orderItems.orders,
        counts,
        curentPage: Number(req.query.page),
        totalOrders: orderItems.totalOrders
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userProductRate: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);
      const [ product ] = await userHelper.getSingleProducts(req.params.productId);
      res.status(200).render("userSide/ProductReview", {
        category,
        product,
        counts
      });
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  userWallet: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get wallet details of specific user
      const userWallet = await userHelper.getUserWallet(req.session.isUserAuth);

      res.status(200).render('userSide/userWallet', {category, counts, userWallet});
    } catch (err) {
      console.log("user Wallet err err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  },
  orderDetails: async (req, res) => {
    try {
      //userHelper fn to get all listed category
      const category = await userHelper.getAllListedCategory();

      //userHelper fn to get counts of product in cart and wishlist
      const counts = await userHelper.getTheCountOfWhislistCart(req.session.isUserAuth);

      //userHelper fn to get the order Details of singleProduct
      const orderDetails = await userHelper.getSingleOrderfDetails(req.params, req.session.isUserAuth);

      //userHelper fn to get the userDetails
      const [ user ] = await userHelper.getUserInfo(req.session.isUserAuth);

      if(!orderDetails){
        return res.status(401).redirect('/userOrders');
      }

      res.status(200).render('userSide/userOrderSummaryPage', { category, counts, orderDetails, user });
    } catch (err) {
      console.log("user order summary err err:", err);
      res.status(500).render("errorPages/500ErrorPage");
    }
  }
};
