const Userdb = require("../../model/userSide/userModel");
const Otpdb = require("../../model/userSide/otpModel");
const Productdb = require("../../model/adminSide/productModel").Productdb;
const ProductVariationdb =
  require("../../model/adminSide/productModel").ProductVariationdb;
const Cartdb = require("../../model/userSide/cartModel");
const userVariationdb = require("../../model/userSide/userVariationModel");
const Orderdb = require('../../model/userSide/orderModel');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { default: mongoose } = require("mongoose");
const cartdb = require("../../model/userSide/cartModel");
const axios = require("axios");

function capitalizeFirstLetter(str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const deleteOtpFromdb = async (_id) => {
  await Otpdb.deleteOne({ _id });
};

const otpGenrator = () => {
  return `${Math.floor(1000 + Math.random() * 9000)}`;
};

const sendOtpMail = async (req, res, getRoute) => {
  const otp = otpGenrator();

  console.log(otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  const MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Ecart",
      link: "https://mailgen.js/",
      logo: "Ecart",
    },
  });

  const response = {
    body: {
      name: req.session.verifyEmail,
      intro: "Your OTP for Ecart verification is:",
      table: {
        data: [
          {
            OTP: otp,
          },
        ],
      },
      outro: "Looking forward to doing more business",
    },
  };

  const mail = MailGenerator.generate(response);

  const message = {
    from: process.env.AUTH_EMAIL,
    to: req.session.verifyEmail,
    subject: "Ecart OTP Verification",
    html: mail,
  };

  try {
    const newOtp = new Otpdb({
      email: req.session.verifyEmail,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
    });
    const data = await newOtp.save();
    req.session.otpId = data._id;
    res.status(200).redirect(getRoute);
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};

const userOtpVerify = async (req, res, getRoute) => {
  try {
    const data = await Otpdb.findOne({ _id: req.session.otpId });

    if (!data) {
      req.session.otpError = "OTP Expired";
      req.session.rTime = "0";
      return res.status(401).redirect(getRoute);
    }

    if (data.expiresAt < Date.now()) {
      req.session.otpError = "OTP Expired";
      req.session.rTime = "0";
      deleteOtpFromdb(req.session.otpId);
      return res.status(401).redirect(getRoute);
    }

    if (data.otp != req.body.otp) {
      req.session.otpError = "Wrong OTP";
      req.session.rTime = req.body.rTime;
      return res.status(401).redirect(getRoute);
    }

    return true;
  } catch (err) {
    console.log("Function error", err);
    res.status(500).send("Error while quering data err:");
  }
};

module.exports = {
  userLogin: async (req, res) => {
    try {
      if (!req.body.email) {
        req.session.email = `This Field is required`;
      }

      if (!req.body.password) {
        req.session.password = `This Field is required`;
      }

      if (req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
        req.session.email = `Not a valid Gmail address`;
      }

      if (req.session.email || req.session.password) {
        req.session.userInfo = req.body.email;
        return res.status(401).redirect("/userLogin");
      }

      const data = await Userdb.findOne({ email: req.body.email });

      if (data) {
        if (bcrypt.compareSync(req.body.password, data.password)) {
          if (!data.userStatus) {
            req.session.userBlockedMesg = true;
            return res.status(200).redirect("/userLogin");
          }
          req.session.isUserAuth = data._id; 
          res.status(200).redirect("/"); //Login Sucessfull
          await Userdb.updateOne(
            { _id: data._id },
            { $set: { userLstatus: true } }
          );
        } else {
          req.session.userInfo = req.body.email;
          req.session.invalidUser = `Invalid credentials!`;
          res.status(401).redirect("/userLogin"); //Wrong Password or email
        }
      } else {
        req.session.userInfo = req.body.email;
        req.session.invalidUser = `No user with that email`;
        res.status(401).redirect("/userLogin"); //No user Found server err
      }
    } catch (err) {
      req.session.invalidUser = true;
      res.status(401).redirect("/userLogin");
    }
  },
  userRegister: async (req, res) => {
    const userInfo = {};
    if (!req.body.fullName) {
      req.session.fName = `This Field is required`;
    } else {
      userInfo.fName = req.body.fullName;
    }
    if (!req.body.phoneNumber) {
      req.session.phone = `This Field is required`;
    }
    if (!req.body.password) {
      req.session.pass = `This Field is required`;
    }
    if (!req.body.confirmPassword) {
      req.session.conPass = `This Field is required`;
    }
    if (req.body.password != req.body.confirmPassword) {
      req.session.bothPass = `Both Passwords doesn't match`;
    }

    if (
      req.body.phoneNumber &&
      (String(req.body.phoneNumber).length > 10 ||
        String(req.body.phoneNumber).length < 10)
    ) {
      req.session.phone = `Invalid Phonenumber`;
    } else {
      userInfo.phone = req.body.phoneNumber;
    }

    if (
      req.session.fName ||
      req.session.email ||
      req.session.phone ||
      req.session.pass ||
      req.session.conPass ||
      req.session.bothPass
    ) {
      req.session.userRegister = userInfo;
      return res.status(401).redirect("/userRegister");
    }

    if (req.body.password === req.body.confirmPassword) {
      const hashedPass = bcrypt.hashSync(req.body.password, 10);

      try {
        const newUser = new Userdb({
          fullName: req.body.fullName,
          email: req.session.verifyEmail,
          phoneNumber: req.body.phoneNumber,
          password: hashedPass,
          phoneNumber: req.body.phoneNumber,
          userStatus: true,
        });
        await newUser.save();
        req.session.isUserAuth = newUser._id; 
        delete req.session.verifyRegisterPage;
        res.status(401).redirect("/");
      } catch (err) {
        req.session.phone = `Phonenumber is already in use`;
        req.session.userRegister = userInfo;
        res.status(401).redirect("/userRegister");
      }
    }
  },
  userRegisterEmailVerify: async (req, res) => {
    try {
      if (!req.body.email) {
        req.session.isUser = `This Field is required`;
      }

      if (req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
        req.session.isUser = `Not a valid Gmail address`;
      }

      if (req.session.isUser) {
        return res.status(401).redirect("/userRegisterEmailVerify");
      }

      const data = await Userdb.findOne({ email: req.body.email });

      if (data) {
        req.session.isUser = `Email already in use`;
        return res.status(401).redirect("/userRegisterEmailVerify");
      }

      req.session.verifyOtpPage = true;
      req.session.verifyEmail = req.body.email;

      await sendOtpMail(req, res, "/userRegisterOtpVerify"); // send otp as mail
    } catch (err) {
      console.log("Error querying the database:", err);
      res.status(500).send("Internal server error");
    }
  },
  userRegisterOtpVerify: async (req, res) => {
    try {
      if (!req.body.otp) {
        req.session.otpError = `This Field is required`;
      }

      if (String(req.body.otp).length > 4) {
        req.session.otpError = `Enter valid number`;
      }

      if (req.session.otpError) {
        req.session.rTime = req.body.rTime;
        return res.status(200).redirect("/userRegisterOtpVerify");
      }
      const response = await userOtpVerify(req, res, "/userRegisterOtpVerify");

      if (response) {
        deleteOtpFromdb(req.session.otpId);
        req.session.verifyRegisterPage = true;
        res.status(200).redirect("/userRegister");
      }
    } catch (err) {
      console.log("Internal delete error", err);
      res.status(500).send("Error while quering data err:");
    }
  },
  userRegisterEmailVerifyResend: async (req, res) => {
    try {
      deleteOtpFromdb(req.session.otpId);
      sendOtpMail(req, res, "/userRegisterOtpVerify");

      delete req.session.otpError;
      delete req.session.rTime;
    } catch (err) {
      console.log("Resend Mail err:", err);
    }
  },
  userLoginEmailVerify: async (req, res) => {
    try {
      if (!req.body.email) {
        req.session.emailError = `This Field is required`;
      }

      if (req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
        req.session.emailError = `Not a valid Gmail address`;
      }

      if (req.session.emailError) {
        return res.status(401).redirect("/userForgotPassword");
      }
      const data = await Userdb.findOne({ email: req.body.email });

      if (!data) {
        req.session.emailError = "No user with that email";
        return res.status(401).redirect("/userForgotPassword");
      }

      req.session.userId = data._id;
      req.session.verifyEmail = req.body.email;

      await sendOtpMail(req, res, "/userForgotPassword"); // send otp as mail
    } catch (err) {
      console.log("Error querying the database:", err);
      res.status(500).send("Internal server error");
    }
  },
  userLoginOtpVerify: async (req, res) => {
    try {
      if (!req.body.otp) {
        req.session.otpError = `This Field is required`;
      }

      if (String(req.body.otp).length > 4) {
        req.session.otpError = `Enter valid number`;
      }

      if (req.session.otpError) {
        req.session.rTime = req.body.rTime;
        return res.status(200).redirect("/userForgotPassword");
      }

      const response = await userOtpVerify(req, res, "/userForgotPassword");

      if (response) {
        deleteOtpFromdb(req.session.otpId);
        req.session.resetPasswordPage = true;

        delete req.session.verifyEmail;
        res.status(200).redirect("/userLoginResetPassword");
      }
    } catch (err) {
      console.log("Internal delete error", err);
      res.status(500).send("Error while quering data err:");
    }
  },
  userLoginEmailVerifyResend: async (req, res) => {
    try {
      deleteOtpFromdb(req.session.otpId);
      sendOtpMail(req, res, "/userForgotPassword");

      delete req.session.otpError;
      delete req.session.rTime;
    } catch (err) {
      console.log("Resend Mail err:", err);
    }
  },
  userLoginResetPass: async (req, res) => {
    try {
      if (!req.body.newPassword) {
        req.session.newPass = `This Field is required`;
      }

      if (!req.body.confirmPassword) {
        req.session.conPass = `This Field is required`;
      }

      if (req.body.newPassword != req.body.confirmPassword) {
        req.session.errMesg = `Both passwords doesn't Match`;
      }

      if (req.session.newPass || req.session.conPass || req.session.errMesg) {
        return res.status(200).redirect("/userLoginResetPassword");
      }

      const newHashedPass = bcrypt.hashSync(req.body.newPassword, 10);

      await Userdb.updateOne(
        { _id: req.session.userId },
        {
          $set: {
            password: newHashedPass,
          },
        }
      );

      delete req.session.userId;
      delete req.session.resetPasswordPage;

      res.status(200).redirect("/userLogin");
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).send("Internal server error");
    }
  },
  userProductCategory: async (req, res) => {
    try {
      const result = await Productdb.aggregate([
        {
          $match: {
            category: req.params.category,
            unlistedProduct: false,
          },
        },
        {
          $lookup: {
            from: "productvariationdbs",
            localField: "_id",
            foreignField: "productId",
            as: "variations",
          },
        },
      ]);

      res.status(200).send(result);
    } catch (err) {
      console.log("Update query err:", err);
      res.status(500).send("Internal server error");
    }
  },
  userLogOut: async (req, res) => {
    await Userdb.updateOne(
      { _id: req.session.isUserAuth },
      { $set: { userLstatus: false } }
    );

    req.session.destroy(); // diffrent browser use chey then seesion destroy ayalum admin session povulla
      
    res.status(200).redirect("/");
  },
  getproduct: async (req, res) => {
    try {
      const result = await Productdb.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: "productvariationdbs",
            localField: "_id",
            foreignField: "productId",
            as: "variations",
          },
        },
      ]);
      res.send(result);
    } catch (err) {
      res.send("err");
    }
  },
  newlyLauched: async (req, res) => {
    try {
      const result = await Productdb.aggregate([
        {
          $match: {
            newlyLauch: true,
            unlistedProduct: false,
          },
        },
        {
          $lookup: {
            from: "productvariationdbs",
            localField: "_id",
            foreignField: "productId",
            as: "variations",
          },
        },
      ]);
      res.send(result);
    } catch (err) {
      res.send("err");
    }
  },
  userCartNow: async (req, res) => {
    const isCart = await Cartdb.findOne({ userId: req.session.isUserAuth });

    if (!isCart) {
      const newUserCart = new Cartdb({
        userId: req.session.isUserAuth,
        products: [
          {
            productId: req.params.productId,
          },
        ],
      });
      await newUserCart.save();
      return res
        .status(200)
        .redirect(`/userProductDetail/${req.params.productId}`);
    }

    await Cartdb.updateOne(
      { _id: isCart._id },
      { $push: { products: { productId: req.params.productId } } }
    );
    res.status(200).redirect(`/userProductDetail/${req.params.productId}`);
  },
  getCartItems: async (req, res) => {
    try {
      if (req.params.isUserAuth === "undefined") {
        return res.send(false);
      }
      const cartItem = await Cartdb.findOne({ userId: req.params.isUserAuth });
      if (!cartItem) {
        return res.send(false);
      }
      const isItem = cartItem.products.find((value) => {
        if (value.productId.toString() === req.params.productId) {
          return true;
        }
      });
      if (isItem) {
        res.send(true);
      } else {
        res.send(false);
      }
    } catch (err) {
      console.log("err");
    }
  },
  getCartAllItem: async (req, res) => {
    const agg = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.params.userId),
        },
      },
      {
        $unwind: {
          path: "$products",
        },
      },
      {
        $lookup: {
          from: "productdbs",
          localField: "products.productId",
          foreignField: "_id",
          as: "pDetails",
        },
      },
      {
        $match: {
          "pDetails.unlistedProduct": false,
        },
      },
      {
        $lookup: {
          from: "productvariationdbs",
          localField: "products.productId",
          foreignField: "productId",
          as: "variations",
        },
      }, 
    ]; 
    const cartItems = await Cartdb.aggregate(agg);
    res.send(cartItems);
  },
  userCartDelete: async (req, res) => {
    try {
      await Cartdb.updateOne(
        { userId: req.session.isUserAuth },
        { $pull: { products: { productId: req.params.productId } } }
      );

      res.redirect("/usersAddToCart");
    } catch (err) {
      console.log("cart Update err");
      res.status(500).send("Internal server err");
    }
  },
  userCartItemUpdate: async (req, res) => {
    const cartProduct = await cartdb.findOne({userId: req.session.isUserAuth, "products.productId": req.params.productId}, {"products.$": 1});
    const stock = await ProductVariationdb.findOne({productId: req.params.productId}, {quantity: 1});
    
    if (Number(req.params.values) !== 0) {
      if((cartProduct.products[0].quandity + 1) > stock.quantity){
        return res.json({
          message: `Only ${stock.quantity} stocks available `,
          result: false,
          stock: stock.quantity
        });
      }
      const cartItem = await Cartdb.updateOne(
        {
          userId: req.session.isUserAuth,
          "products.productId": req.params.productId,
        },
        { $inc: { "products.$.quandity": 1 } }
      );

      return res.json({
        message: "Successful inc",
        result: true
      });
    }
    if((cartProduct.products[0].quandity - 1) < 1){
      return res.json({
        message: "Successful dec",
        result: false,
        stock: stock.quantity
      });
    }
    const cartItem = await Cartdb.updateOne(
      {
        userId: req.session.isUserAuth,
        "products.productId": req.params.productId,
      },
      { $inc: { "products.$.quandity": -1 } }
    );

    return res.json({
      message: "Successful dec",
      result: true,
      stock: stock.quantity
    });
  },
  userInfo: async (req, res) => {
    try {
      const agg = [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.userId),
          },
        },
        {
          $lookup: {
            from: "uservariationdbs",
            localField: "_id",
            foreignField: "userId",
            as: "variations",
          },
        },
      ];
      const user = await Userdb.aggregate(agg);
      res.send(user[0]);
    } catch (err) {
      console.log("cart Update err");
      res.status(500).send("Internal server err");
    }
  },
  userUpdateAccount: async (req, res) => {
    if (!req.body.fName) {
      req.session.fName = `This Field is required`;
    }

    if (!req.body.email) {
      req.session.email = `This Field is required`;
    }

    if (req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
      req.session.email = `Not a valid Gmail address`;
    }

    if (!req.body.phone) {
      req.session.phone = `This Field is required`;
    }

    if (req.body.phone && String(req.body.phone).length != 10) {
      req.session.phone = `Not a Valid Number`;
    }

    if (req.body.oldPass || req.body.password || req.body.cPass) {
      if (!req.body.oldPass) {
        req.session.oldPass = `This Field is required`;
      }

      if (!req.body.password) {
        req.session.password = `This Field is required`;
      }

      if (!req.body.cPass) {
        req.session.cPass = `This Field is required`;
      }

      if (req.body.password !== req.body.cPass) {
        req.session.cPass = `Both Password doesn't Match`;
      }
    }

    if (req.body.oldPass && req.body.password && req.body.cPass) {
      const userInfo = await Userdb.findOne({ _id: req.session.isUserAuth });
      if (!bcrypt.compareSync(req.body.oldPass, userInfo.password)) {
        req.session.oldPass = `Incorrect Password`;
      }
    }

    if (
      req.session.fName ||
      req.session.email ||
      req.session.phone ||
      req.session.oldPass ||
      req.session.password ||
      req.session.cPass
    ) {
      req.session.savedInfo = {
        fName: req.body.fName,
        email: req.body.email,
        phone: req.body.phone,
      };
      return res.status(401).redirect("/userUpdateAccount");
    }

    const userInfo = await Userdb.findOne({ _id: req.session.isUserAuth });

    if (userInfo.email !== req.body.email) {
      // write the logic code to send otp and verify otp to proced
    }

    if (req.body.oldPass) {
      const hashedPass = bcrypt.hashSync(req.body.password, 10);

      const uUser = {
        fullName: req.body.fName,
        phoneNumber: req.body.phone,
        email: req.body.email,
        password: hashedPass,
      };

      await Userdb.updateOne({ _id: req.session.isUserAuth }, { $set: uUser });
    } else {
      const uUser = {
        fullName: req.body.fName,
        phoneNumber: req.body.phone,
        email: req.body.email,
      };

      await Userdb.updateOne({ _id: req.session.isUserAuth }, { $set: uUser });
    }

    res.status(200).redirect("/userAccount");
  },
  userAddAddress: async (req, res) => {
    try {
      if (!req.body.locality) {
        req.session.locality = `This Field is required`;
      }

      if (!req.body.country) {
        req.session.country = `This Field is required`;
      }

      if (!req.body.district) {
        req.session.district = `This Field is required`;
      }

      if (!req.body.state) {
        req.session.state = `This Field is required`;
      }

      if (!req.body.city) {
        req.session.city = `This Field is required`;
      }

      if (!req.body.hNo) {
        req.session.hNo = `This Field is required`;
      }
      if (!req.body.hName) {
        req.session.hName = `This Field is required`;
      }

      if (!req.body.pin) {
        req.session.pin = `This Field is required`;
      }

      if (
        req.session.pin ||
        req.session.hNo ||
        req.session.city ||
        req.session.state ||
        req.session.district ||
        req.session.country ||
        req.session.locality
      ) {
        req.session.sAddress = req.body;
        return res.status(401).redirect("/addAddress");
      }

      req.body.locality = capitalizeFirstLetter(req.body.locality);
      req.body.country = capitalizeFirstLetter(req.body.country);
      req.body.district = capitalizeFirstLetter(req.body.district);
      req.body.state = capitalizeFirstLetter(req.body.state);
      req.body.city = capitalizeFirstLetter(req.body.city);
      req.body.hName = capitalizeFirstLetter(req.body.hName);

      const isAddress = await userVariationdb.findOne({
        userId: req.session.isUserAuth,
        "address.locality": req.body.locality,
        "address.country": req.body.country,
        "address.district": req.body.district,
        "address.state": req.body.state,
        "address.city": req.body.city,
        "address.hNo": req.body.hNo,
        "address.hName": req.body.hName,
        "address.pin": req.body.pin,
      });

      if (isAddress) {
        req.session.exist = `This address already exist`
        return res.status(401).redirect("/addAddress");
      }

      const structuredAddress = `${req.body.hName} ${req.body.hNo}, ${req.body.locality}, ${req.body.district}, ${req.body.city}, ${req.body.state} - ${req.body.pin}`;

      await userVariationdb.updateOne(
        { userId: req.session.isUserAuth },
        {
          $push: {
            address: {
              locality: req.body.locality,
              country: req.body.country,
              district: req.body.district,
              state: req.body.state,
              city: req.body.city,
              hName: req.body.hName,
              hNo: req.body.hNo,
              pin: req.body.pin,
              structuredAddress,
            },
          },
        },
        { upsert: true }
      );

      const addres = await userVariationdb.findOne({
        userId: req.session.isUserAuth,
      });

      if (!addres.defaultAddress || addres.address.length === 1) {
        await userVariationdb.updateOne(
          { userId: req.session.isUserAuth },
          { $set: { defaultAddress: addres.address[0]._id } }
        );
      }

      res.status(200).redirect("/userEditAddress");
    } catch (err) {
      console.log("err");
    }
  },
  userChangeDefault: async (req, res) => {
    await userVariationdb.updateOne(
      { userId: req.session.isUserAuth },
      { $set: { defaultAddress: req.params.adId } }
    );
    res.status(200).redirect("/userEditAddress");
  },
  deleteAddress: async (req, res) => {
    try {
      const address = await userVariationdb.findOneAndUpdate(
        { userId: req.session.isUserAuth },
        { $pull: { address: { _id: req.params.adId } } }
      );

      if (
        String(address.defaultAddress) === req.params.adId &&
        address.address.length > 1
      ) {
        const addres = await userVariationdb.findOne({
          userId: req.session.isUserAuth,
        });

        await userVariationdb.updateOne(
          { userId: req.session.isUserAuth },
          { $set: { defaultAddress: addres.address[0]._id } }
        );
      }
      res.status(200).redirect("/userEditAddress");
    } catch (err) {
      console.log("err");
    }
  },
  getAddress: async (req, res) => {
    try {
      const address = await userVariationdb.findOne({
        "address._id": req.params.adId,
      });

      const oneAdd = address.address.find((value) => {
        return String(value._id) === req.params.adId;
      });

      res.send(oneAdd);
    } catch (err) {
      console.log("err");
      res.status(500).send("Internal Server err");
    }
  },
  userupdateAddress: async (req, res) => {
    if (!req.body.locality) {
      req.session.locality = `This Field is required`;
    }

    if (!req.body.country) {
      req.session.country = `This Field is required`;
    }

    if (!req.body.district) {
      req.session.district = `This Field is required`;
    }

    if (!req.body.state) {
      req.session.state = `This Field is required`;
    }

    if (!req.body.city) {
      req.session.city = `This Field is required`;
    }

    if (!req.body.hNo) {
      req.session.hNo = `This Field is required`;
    }
    if (!req.body.hName) {
      req.session.hName = `This Field is required`;
    }

    if (!req.body.pin) {
      req.session.pin = `This Field is required`;
    }

    if (
      req.session.pin ||
      req.session.hNo ||
      req.session.city ||
      req.session.state ||
      req.session.district ||
      req.session.country ||
      req.session.locality
    ) {
      req.session.sAddress = req.body;
      return res.status(401).redirect(`/editAddress/${req.query.adId}`);
    }

    req.body.locality = capitalizeFirstLetter(req.body.locality);
    req.body.country = capitalizeFirstLetter(req.body.country);
    req.body.district = capitalizeFirstLetter(req.body.district);
    req.body.state = capitalizeFirstLetter(req.body.state);
    req.body.city = capitalizeFirstLetter(req.body.city);
    req.body.hName = capitalizeFirstLetter(req.body.hName);

    const isAddress = await userVariationdb.findOne({
      userId: req.session.isUserAuth,
      "address.locality": req.body.locality,
      "address.country": req.body.country,
      "address.district": req.body.district,
      "address.state": req.body.state,
      "address.city": req.body.city,
      "address.hNo": req.body.hNo,
      "address.hName": req.body.hName,
      "address.pin": req.body.pin,
    });

    if (isAddress) {
      req.session.exist = `This address already exist`
      return res.status(401).redirect(`/editAddress/${req.query.adId}`);
    }

    const structuredAddress = `${req.body.hName} ${req.body.hNo}, ${req.body.locality}, ${req.body.district}, ${req.body.city}, ${req.body.state} - ${req.body.pin}`;

    await userVariationdb.updateOne(
      { userId: req.session.isUserAuth, "address._id": req.query.adId },
      {
        $set: {
          "address.$.locality": req.body.locality,
          "address.$.country": req.body.country,
          "address.$.district": req.body.district,
          "address.$.state": req.body.state,
          "address.$.city": req.body.city,
          "address.$.hName": req.body.hName,
          "address.$.hNo": req.body.hNo,
          "address.$.pin": req.body.pin,
          "address.$.structuredAddress": structuredAddress,
        },
      }
    );

    res.status(200).redirect("/userEditAddress");
  },
  userBuyNowCheckOut: async (req, res) => {
    try {
        if(req.body.qty <= 0){
          return res.redirect(`/userBuyNow/${req.body.proId}`);
        }
  
        const quantity = await ProductVariationdb.findOne({productId: req.body.proId});
  
        if(quantity.quantity < req.body.qty) {
          req.session.savedQty = req.body.qty;
          req.session.avalQty = `Only ${quantity.quantity} stocks available`;
          return res.status(401).redirect(`/userBuyNow/${req.body.proId}`)
        }
        
        req.session.buyNowPro = {
          pId: req.body.proId,
          qty: req.body.qty
        };
      res.status(200).redirect(`/userBuyNowCheckOut`);

    } catch (err) {
      console.log('payment err');
      res.status(500).send("Internal server error");
    }
  },
  changeAddressPayment: async (req, res) => {
    try {
      await userVariationdb.updateOne(
        { userId: req.session.isUserAuth },
        { $set: { defaultAddress: req.body.adId } }
      );
      if(req.session.isCartItem){
        return res.status(200).redirect(`/userBuyNowCheckOut?payFrom=cart`);
      }
      res.status(200).redirect(`/userBuyNowCheckOut`);
    } catch (err) {
      console.log('payment err');
      res.status(500).send("Internal server error");
    }
  },
  userBuyNowPaymentOrder: async (req, res) => {

    if(req.session.isCartItem){
      
      if(!req.body.adId){
        req.session.payErr = `Choose an Address`;
      }
      if (!req.body.payMethode) {
        req.session.payErr = `Choose a payment Methode`;
      }

      if(req.session.payErr  || req.session.payErr){
        return res.status(401).redirect('/userBuyNowCheckOut?payFrom=cart')
      }

      const cartItems = await axios.post(
        `http://localhost:${process.env.PORT}/api/getCartAllItem/${req.session.isUserAuth}`
      );
      
      let flag=0;
      cartItems.data.forEach(element => {
        if(element.products.quandity > element.variations[0].quantity){
          flag = 1;
        }
      });
  
      if(flag === 1){
        return res.redirect('/usersAddToCart');
      }

      const orderItems = cartItems.data.map(element => {
        return {
          productId: element.products.productId,
          pName: element.pDetails[0].pName,
          category: element.pDetails[0].category,
          sTittle: element.pDetails[0].sTittle,
          hDescription: element.pDetails[0].hDescription,
          pDescription: element.pDetails[0].pDescription,
          quantity: element.products.quandity,
          fPrice: element.pDetails[0].fPrice,
          lPrice: element.pDetails[0].lPrice,
          color: element.variations[0].color,
          images: element.variations[0].images[0],
        }
      });

      if(req.body.payMethode === 'COD'){
        orderItems.forEach(async (element) => {
          await ProductVariationdb.updateOne({productId: element.productId}, {$inc: {quantity: (element.quantity * -1)}});
        })
        const newOrder = new Orderdb({
          userId: req.session.isUserAuth,
          orderItems: orderItems,
          paymentMethode: "COD",
          addressId: req.body.adId
        });

        await newOrder.save();
        await Cartdb.updateOne({userId: req.session.isUserAuth}, {$set: {products: []}}); // empty cart items
        req.session.orderSucessPage = true;
        return res.status(200).redirect('/userOrderSuccessfull');
      }
    }

    if(!req.body.adId){
      //logic for no address
      return res.status(200).redirect(`/userBuyNowCheckOut`);
    }
    if (!req.body.payMethode) {
      req.session.payErr = `Choose a payment Methode`;
      return res.status(200).redirect(`/userBuyNowCheckOut`);
    }

    const produtDetails = await Productdb.findOne({_id: req.session.buyNowPro.pId});
    const product = await ProductVariationdb.findOne({productId: req.session.buyNowPro.pId});

    if(product.quantity < req.session.buyNowPro.qty){
      req.session.savedQty = req.session.buyNowPro.qty;
      req.session.avalQty = `Only ${product.quantity} stocks available`;
      return res.status(401).redirect(`/userBuyNow/${req.session.buyNowPro.pId}`);
    }

    if(req.body.payMethode === 'COD'){
      console.log(req.body);
      await ProductVariationdb.updateOne({productId: req.session.buyNowPro.pId}, {$inc: {quantity: (Number(req.session.buyNowPro.qty) * -1)}});
      const newOrder = new Orderdb({
        userId: req.session.isUserAuth,
        orderItems: [
          {
            productId: req.session.buyNowPro.pId,
            quantity: req.session.buyNowPro.qty,
            pName: produtDetails.pName,
            category: produtDetails.category,
            sTittle: produtDetails.sTittle,
            hDescription: produtDetails.hDescription,
            pDescription: produtDetails.pDescription,
            fPrice: produtDetails.fPrice,
            lPrice: produtDetails.lPrice,
            color: product.color,
            images: product.images[0],
            fPrice: produtDetails.fPrice,
            lPrice: produtDetails.lPrice,
          }
        ],
        paymentMethode: "COD",
        addressId: req.body.adId
      });

      await newOrder.save();
      req.session.orderSucessPage = true;
      res.status(200).redirect('/userOrderSuccessfull');
    }
  },
  userCartCheckOut: async (req, res) => {
    const cartItems = await axios.post(
      `http://localhost:${process.env.PORT}/api/getCartAllItem/${req.session.isUserAuth}`
    );

    if(cartItems.data.length === 0){
      req.session.vartErr = `Add Items to cart`;
      return res.status(401).redirect('/usersAddToCart');
    }
    
    let flag=0;
    cartItems.data.forEach(element => {
      if(element.products.quandity > element.variations[0].quantity){
        flag = 1;
      }
    });

    if(flag === 1){
      return res.redirect('/usersAddToCart');
    }
    res.redirect('/userBuyNowCheckOut?payFrom=cart');
  },
  getAllOrder: async (req, res) => {
    try {
      const agg = [
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.params.userId),
          },
        },
        {
          '$unwind': {
            'path': '$orderItems'
          }
        }
      ];

      const orderItems = await Orderdb.aggregate(agg);

      return res.send(orderItems);
    } catch (err) {
      console.log('order agg err');
      res.status(200).send('Internal server err');
    }
  },
  userOrderCancel: async (req, res) => {
    await Orderdb.updateOne({userId: req.session.isUserAuth, "orderItems._id": req.params.orderId}, {$set: {"orderItems.$.orderStatus": "Cancelled"}})
    res.status(200).redirect('/userOrders');
  }
};
