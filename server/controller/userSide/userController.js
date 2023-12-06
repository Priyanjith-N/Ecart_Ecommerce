const Userdb = require("../../model/userSide/userModel");
const Otpdb = require("../../model/userSide/otpModel");
const Productdb = require("../../model/adminSide/productModel").Productdb;
const ProductVariationdb =
  require("../../model/adminSide/productModel").ProductVariationdb;
const Cartdb = require('../../model/userSide/cartModel');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { default: mongoose } = require("mongoose");

const deleteOtpFromdb = async (_id) => {
  await Otpdb.deleteOne({ _id });
};

const otpGenrator = () => {
  return `${Math.floor(1000 + Math.random() * 9000)}`;
};

const sendOtpMail = async (req, res, getRoute) => {
  const otp = otpGenrator();

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
      if(!req.body.email){
        req.session.email = `This Field is required`
      }

      if(!req.body.password){
        req.session.password = `This Field is required`
      }

      if(req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)){
        req.session.email = `Not a valid Gmail address`
      }

      if (req.session.email || req.session.password) {
        return res.status(401).redirect('/userLogin');
      }

      const data = await Userdb.findOne({ email: req.body.email });

      if (data) {
        if (bcrypt.compareSync(req.body.password, data.password)) {
          if(!data.userStatus){
            req.session.userBlockedMesg = true;
            return res.status(200).redirect('/userLogin');
          }
          req.session.isUserAuth = data._id; // temp
          res.status(200).redirect("/"); //Login Sucessfull
          await Userdb.updateOne({ _id: data._id }, {$set: {userLstatus: true}});
        } else {
          req.session.userInfo = req.body.email;
          req.session.invalidUser = `Invalid credentials!`;
          res.status(401).redirect("/userLogin"); //Wrong Password or email
        }
      } else {
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
    }else{
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
    if(req.body.password != req.body.confirmPassword){
      req.session.bothPass = `Both Passwords doesn't match`;
    }

    if(req.body.phoneNumber && (String(req.body.phoneNumber).length > 10 || String(req.body.phoneNumber).length < 10)){
      req.session.phone = `Invalid Phonenumber`;
    }else{
      userInfo.phone = req.body.phoneNumber;
    }

    if(req.session.fName || req.session.email || req.session.phone || req.session.pass || req.session.conPass || req.session.bothPass){
      req.session.userRegister = userInfo;
      return res.status(401).redirect('/userRegister');
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
        delete req.session.verifyRegisterPage;
        res.status(401).redirect("/userLogin");
      } catch (err) {
        req.session.phone = `Phonenumber is already in use`
        req.session.userRegister = userInfo;
        res.status(401).redirect("/userRegister");
      }
    }
  },
  userRegisterEmailVerify: async (req, res) => {
    try {
      if(!req.body.email){
        req.session.isUser = `This Field is required`
      }

      if(req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)){
        req.session.isUser = `Not a valid Gmail address`
      }

      if (req.session.isUser) {
        return res.status(401).redirect('/userRegisterEmailVerify');
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
      if(!req.body.otp){
        req.session.otpError = `This Field is required`;
      }

      if(String(req.body.otp).length > 4){
        req.session.otpError = `Enter valid number`;
      }

      if(req.session.otpError){
        req.session.rTime = req.body.rTime;
        return res.status(200).redirect('/userRegisterOtpVerify')
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
      if(!req.body.email){
        req.session.emailError = `This Field is required`
      }

      if(req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)){
        req.session.emailError = `Not a valid Gmail address`
      }

      if (req.session.emailError) {
        return res.status(401).redirect('/userForgotPassword');
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
      if(!req.body.otp){
        req.session.otpError = `This Field is required`;
      }

      if(String(req.body.otp).length > 4){
        req.session.otpError = `Enter valid number`;
      }

      if(req.session.otpError){
        req.session.rTime = req.body.rTime;
        return res.status(200).redirect('/userForgotPassword')
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
      if(!req.body.newPassword){
        req.session.newPass = `This Field is required`;
      }

      if(!req.body.confirmPassword){
        req.session.conPass = `This Field is required`;
      }

      if (req.body.newPassword != req.body.confirmPassword) {
        req.session.errMesg = `Both passwords doesn't Match`;
      }
      
      if(req.session.newPass || req.session.conPass || req.session.errMesg){
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
  userLogOut:  (req, res) => {
    req.session.destroy(); // diffrent browser use chey then seesion destroy ayalum admin session povulla
    
    res.status(200).redirect('/'); 
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
      res.send('err');
    }
  },
  newlyLauched: async (req, res) => {
    try {
      const result = await Productdb.aggregate([
        {
          $match: {
            newlyLauch: true,
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
      res.send('err');
    }
  },
  userCartNow: async (req, res) => {
    const isCart = await Cartdb.findOne({userId: req.session.isUserAuth});

    if(!isCart){
      const newUserCart = new Cartdb({
        userId: req.session.isUserAuth,
        products: [{
          productId: req.params.productId
        }]
      });
      await newUserCart.save();
      return res.status(200).redirect(`/userProductDetail/${req.params.productId}`);
    }

    await Cartdb.updateOne({_id: isCart._id}, {$push: {products: {productId: req.params.productId}}});
    res.status(200).redirect(`/userProductDetail/${req.params.productId}`);
  },
  getCartItems: async (req, res) => {
    try {
      if(req.params.isUserAuth === 'undefined'){
        return res.send(false);
      }
      const cartItem = await Cartdb.findOne({userId: req.params.isUserAuth});
      if(!cartItem){
        return res.send(false);
      }
      const isItem = cartItem.products.find((value) => {
        if(value.productId.toString() === req.params.productId){
          return true;
        }
      });
      if(isItem){
        res.send(true);
      }else{
        res.send(false);
      }
    } catch (err) {
        console.log('err');
    }
  },
  getCartAllItem: async (req, res) => {
    const agg = [
      {
        '$match': {
          userId: new mongoose.Types.ObjectId(req.params.userId)
        }
      },
      {
        '$unwind': {
          'path': '$products'
        }
      }, {
        '$lookup': {
          'from': 'productdbs', 
          'localField': 'products.productId', 
          'foreignField': '_id', 
          'as': 'pDetails'
        }
      }, {
        '$lookup': {
          'from': 'productvariationdbs', 
          'localField': 'products.productId', 
          'foreignField': 'productId', 
          'as': 'variations'
        }
      }
    ];
    const cartItems = await Cartdb.aggregate(agg);
    res.send(cartItems);
  },
  userCartDelete: async (req, res) => {
    try {
      await Cartdb.updateOne({userId: req.session.isUserAuth}, {$pull: {products: {productId: req.params.productId}}});
    
      res.redirect('/usersAddToCart');
    } catch (err) {
      console.log('cart Update err');
      res.status(500).send('Internal server err');
    }
  },
  userCartItemUpdate: async (req, res) => {
    console.log(req.params.productId, req.params.values, req.session.isUserAuth);
    if(Number(req.params.values) !== 0){
      const cartItem = await Cartdb.updateOne({userId: req.session.isUserAuth, "products.productId": req.params.productId},{ $inc: { 'products.$.quandity': 1 } });
      console.log(cartItem);
      return;
    }
    const cartItem = await Cartdb.updateOne({userId: req.session.isUserAuth, "products.productId": req.params.productId},{ $inc: { 'products.$.quandity': -1 } });
    console.log('here was');
  },
  userInfo: async (req, res) => {
    try {
      const user = await Userdb.findOne({_id: req.params.userId});
      res.send(user);
    } catch (err) {
      console.log('cart Update err');
      res.status(500).send('Internal server err');
    }
  }
};
