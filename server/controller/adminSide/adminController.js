const adminEmail = `admin@gmail.com`;
const adminPassword = `123`;

const mongodb = require("mongoose");
const Userdb = require("../../model/userSide/userModel");
const Productdb = require("../../model/adminSide/productModel").Productdb;
const ProductVariationdb =
  require("../../model/adminSide/productModel").ProductVariationdb;
const Categorydb = require("../../model/adminSide/category").Categorydb;
const Orderdb = require("../../model/userSide/orderModel");
const fs = require("fs");
const path = require("path");

function capitalizeFirstLetter(str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  adminLogin: (req, res) => {
    if (!req.body.email) {
      req.session.adminEmail = `This Field is required`;
    }

    if (!req.body.password) {
      req.session.adminPassword = `This Field is required`;
    }

    if (req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
      req.session.adminEmail = `Not a valid Gmail address`;
    }

    if (req.session.adminEmail || req.session.adminPassword) {
      return res.status(401).redirect("/adminLogin");
    }
    if (req.body.password === adminPassword && req.body.email === adminEmail) {
      req.session.isAdminAuth = true;
      res.status(200).redirect("/adminHome"); //Login Sucessfull
    } else {
      req.session.invalidAdmin = `Invalid credentials!`;
      res.status(401).redirect("/adminLogin"); //Wrong Password or email
    }
  },
  countUser: async (req, res) => {
    try {
      const userCount = await Userdb.countDocuments();
      const [newOrders] = await Orderdb.aggregate([
        {
          '$unwind': {
            'path': '$orderItems'
          }
        }, {
          '$match': {
            'orderItems.orderStatus': 'Ordered'
          }
        }, {
          '$count': 'newOrders'
        }
      ]);
      const [tSalary] = await Orderdb.aggregate([
        {
          '$unwind': {
            'path': '$orderItems'
          }
        }, {
          '$match': {
            'orderItems.orderStatus': 'Delivered'
          }
        }, {
          '$group': {
            '_id': null, 
            'tSalary': {
              '$sum': { $multiply: ['$orderItems.lPrice', '$orderItems.quantity'] }
            }
          }
        }, {
          '$project': {
            '_id': 0
          }
        }
      ]);
      
      res.json({
        userCount,
        newOrders: newOrders?.newOrders,
        tSalary: tSalary?.tSalary
      });
    } catch (err) {
      console.log("query err", err);
      res.status(500).send("Internal server err");
    }
  },
  adminAddProduct: async (req, res) => {
    try {
      if (!req.body.pName) {
        req.session.pName = "This Field is required";
      }
      if (!req.body.subTittle) {
        req.session.subTittle = "This Field is required";
      }
      if (!req.body.dheading) {
        req.session.dheading = "This Field is required";
      }
      if (!req.body.pDescription) {
        req.session.pDescription = "This Field is required";
      }
      if (!req.body.fPrice) {
        req.session.fPrice = "This Field is required";
      }
      if (!req.body.lPrice) {
        req.session.lPrice = "This Field is required";
      }
      if (!req.body.discount) {
        req.session.discount = "This Field is required";
      }
      if (!req.body.color) {
        req.session.color = "This Field is required";
      }
      if (!req.body.quantity) {
        req.session.quantity = "This Field is required";
      }
      if (req.files.length === 0) {
        req.session.files = "This Field is required";
      }

      if (
        req.session.pName ||
        req.session.subTittle ||
        req.session.dheading ||
        req.session.pDescription ||
        req.session.fPrice ||
        req.session.lPrice ||
        req.session.discount ||
        req.session.color ||
        req.session.quantity ||
        req.session.files
      ) {
        req.session.productInfo = req.body;
        return res.status(401).redirect("/adminAddProduct");
      }

      const newlyLanch = req.body.newlyLanch ? req.body.newlyLanch : false;
      const newProduct = new Productdb({
        pName: req.body.pName,
        category: req.body.category,
        sTittle: req.body.subTittle,
        hDescription: req.body.dheading,
        pDescription: req.body.pDescription,
        fPrice: req.body.fPrice,
        lPrice: req.body.lPrice,
        newlyLauch: newlyLanch,
      });

      const data = await newProduct.save();

      const files = req.files;

      const uploadImg = files.map(
        (value) => `/uploadedImages/${value.filename}`
      );

      const newProductVariation = new ProductVariationdb({
        productId: data._id,
        color: req.body.color,
        quantity: req.body.quantity,
        images: uploadImg,
      });

      await newProductVariation.save();

      res.redirect("/adminProductManagement");
    } catch (err) {
      console.log("query err", err);
      res.status(500).send("Internal server err");
    }
  },
  showProduct: async (req, res) => {
    const agg = [
      {
        $match: {
          unlistedProduct: Number(req.params.value)?false : true
        }
      },
      {
        $lookup: {
          from: "productvariationdbs",
          localField: "_id",
          foreignField: "productId",
          as: "variations",
        },
      }

    ]

    const result = await Productdb.aggregate(agg);
    res.send(result);
  },
  adminAddCategory: async (req, res) => {
    try {
      if (!req.body.name) {
        req.session.errMesg = `This Field is required`;
        return res.status(200).redirect("/adminAddCategory");
      }
      req.body.name = capitalizeFirstLetter(req.body.name);
      const newCat = new Categorydb(req.body);

      const result = await newCat.save();

      res.status(200).redirect("/adminCategoryManagement");
    } catch (err) {
      req.session.errMesg = `Category already exist`;
      res.status(401).redirect("/adminAddCategory");
    }
  },
  getCategory: async (req, res) => {
    if(req.query.Search){
      const result = await Categorydb.find({ name: {$regex: req.query.Search,  $options: 'i'}, status: Number(req.params.value)?true:false });
      return res.send(result);
    }
    const result = await Categorydb.find({ status: Number(req.params.value)?true:false });
    res.send(result);
  },
  adminSoftDeleteCategory: async (req, res) => {
    await Categorydb.updateOne(
      { _id: req.params.id },
      { $set: { status: false } }
    );
    res.status(200).redirect("/adminCategoryManagement");
  },
  adminRestoreCategory: async (req, res) => {
    await Categorydb.updateOne(
      { _id: req.params.id },
      { $set: { status: true } }
    );
    res.status(200).redirect("/adminUnlistedCategory");
  },
  adminSoftDeleteProduct: async (req, res) => {
    const data = await Productdb.updateOne({ _id: req.params.id }, {$set: {unlistedProduct: true}});

    res.redirect("/adminProductManagement");
  },
  adminRestoreProduct: async (req, res) => {

    const data = await Productdb.updateOne({ _id: req.params.id }, {$set: {unlistedProduct: false}});

    res.redirect("/adminUnlistedProduct");
  },
  getProduct: async (req, res) => {
    try {
      console.log(req.params.id);
      const [result] = await Productdb.aggregate([
        {
          $match: {
            _id: new mongodb.Types.ObjectId(req.params.id),
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
      return res.send(result);
    } catch (err) {
      console.log("here");
      res.send("internal query err");
    }
  },
  adminDeleteProductImg: async (req, res) => {
    const fileImg = await ProductVariationdb.findOneAndUpdate(
      { productId: req.query.id },
      { $unset: { [`images.${req.query.index}`]: 1 } }
    );

    await ProductVariationdb.updateOne(
      { productId: req.query.id },
      { $pull: { images: null } }
    );

    res.status(200).redirect(`/adminUpdateProduct/${req.query.id}`);
  },
  adminUpdateProduct: async (req, res) => {
    if (!req.body.pName) {
      req.session.pName = "This Field is required";
    }
    if (!req.body.subTittle) {
      req.session.subTittle = "This Field is required";
    }
    if (!req.body.dheading) {
      req.session.dheading = "This Field is required";
    }
    if (!req.body.pDescription) {
      req.session.pDescription = "This Field is required";
    }
    if (!req.body.fPrice) {
      req.session.fPrice = "This Field is required";
    }
    if (!req.body.lPrice) {
      req.session.lPrice = "This Field is required";
    }
    if (req.body.fPrice && req.body.fPrice < 0) {
      req.session.fPrice = "First Price Cannot be Negative";
    }
    if (req.body.lPrice && req.body.lPrice < 0) {
      req.session.lPrice = "Last Price Cannot be Negative";
    }
    if (!req.body.discount) {
      req.session.discount = "This Field is required";
    }
    if (!req.body.color) {
      req.session.color = "This Field is required";
    }
    if (!req.body.quantity) {
      req.session.quantity = "This Field is required";
    }
    if (req.body.quantity && req.body.quantity < 0) {
      req.session.quantity = "Quantity Cannot be Negative";
    }
    if (req.files.length === 0) {
      const data = await ProductVariationdb.findOne({
        productId: req.query.id,
      });
      if (data.images.length === 0) {
        req.session.files = "This Field is required";
      }
    }

    if (
      req.session.pName ||
      req.session.subTittle ||
      req.session.dheading ||
      req.session.pDescription ||
      req.session.fPrice ||
      req.session.lPrice ||
      req.session.discount ||
      req.session.color ||
      req.session.quantity ||
      req.session.files
    ) {
      req.session.updateProductInfo = req.body;
      return res.send(`/adminUpdateProduct/${req.query.id}`);
    }

    const updateProduct = {
      pName: req.body.pName,
      category: req.body.category,
      sTittle: req.body.subTittle,
      hDescription: req.body.dheading,
      pDescription: req.body.pDescription,
      fPrice: req.body.fPrice,
      lPrice: req.body.lPrice,
      newlyLauch: req.body.newlyLanch?true:false,
    };

    await Productdb.updateOne({ _id: req.query.id }, { $set: updateProduct });

    const files = req.files;

    const uploadImg = files.map((value) => `/uploadedImages/${value.filename}`);

    const updateroductVariation = {
      color: req.body.color,
      quantity: req.body.quantity,
    };

    await ProductVariationdb.updateOne(
      { productId: req.query.id },
      { $set: updateroductVariation }  
    );

    if (uploadImg.length > 0) { 
      await ProductVariationdb.updateOne(
        { productId: req.query.id },
        { $push: { images: uploadImg } }
      );
    }

    res.send("/adminProductManagement");
  },
  getAllUser: async (req, res) => {
    try {
      const result = await Userdb.find();
      res.send(result);
    } catch (err) {
      console.log("quer Err", err);
      res.status(401).send("Internal server err");
    }
  },
  adminUserStatus: async (req, res) => {
    if (!Number(req.params.block)) {
      await Userdb.updateOne(
        { _id: req.params.id },
        { $set: { userStatus: false, userLstatus: false } }
      );
      return res.status(200).redirect("/adminUserManagement");
    }
    await Userdb.updateOne(
      { _id: req.params.id },
      { $set: { userStatus: true } }
    );
    res.status(200).redirect("/adminUserManagement");
  },
  adminUserDelete: async (req, res) => {
    try {
      await Userdb.deleteOne({ _id: req.params.id });
      res.status(200).redirect("/adminUserManagement");
    } catch (err) {
      console.log("quer Err", err);
      res.status(401).send("Internal server err");
    }
  },
  adminLogout: (req, res) => {
    req.session.destroy();
    res.status(200).redirect("/adminLogin");
  },
  getAllcartItemsWithFilter: async (req, res) => {
    const filter = req.query.filter;
    let agg;

    if (filter === "undefined" || filter === "All") {
      agg = [
        {
          $unwind: {
            path: "$orderItems",
          },
        },
        {
          $lookup: {
            from: "productdbs",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "pDetails",
          },
        },
        {
          $lookup: {
            from: "productvariationdbs",
            localField: "orderItems.productId",
            foreignField: "productId",
            as: "variations",
          },
        },
        {
          '$lookup': {
            'from': 'userdbs', 
            'localField': 'userId', 
            'foreignField': '_id', 
            'as': 'userInfo'
          }
        }, {
          '$lookup': {
            'from': 'uservariationdbs', 
            'localField': 'userId', 
            'foreignField': 'userId', 
            'as': 'userVariations'
          }
        },
        {
          $sort: {
            orderDate: -1,
          },
        }
      ];
    } else {
      agg = [
        {
          $unwind: {
            path: "$orderItems",
          },
        },
        {
          $match: {
            "orderItems.orderStatus": filter,
          },
        },
        {
          $lookup: {
            from: "productdbs",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "pDetails",
          },
        },
        {
          $lookup: {
            from: "productvariationdbs",
            localField: "orderItems.productId",
            foreignField: "productId",
            as: "variations",
          },
        },
        {
          '$lookup': {
            'from': 'userdbs', 
            'localField': 'userId', 
            'foreignField': '_id', 
            'as': 'userInfo'
          }
        }, {
          '$lookup': {
            'from': 'uservariationdbs', 
            'localField': 'userId', 
            'foreignField': 'userId', 
            'as': 'userVariations'
          }
        },
        {
          $sort: {
            orderDate: -1,
          },
        }
      ];
    }

    const orderedItems = await Orderdb.aggregate(agg);

    res.send(orderedItems);
  },
  adminChangeOrderStatus: async (req, res) => {
    await Orderdb.updateOne({"orderItems._id": req.params.orderId}, {$set: {"orderItems.$.orderStatus": req.body.orderStatus}});
    if(!req.body.filter){
      return res.status(200).redirect('/adminOrderManagement');
    }
    res.status(200).redirect(`/adminOrderManagement?filter=${req.body.filter}`);
  }
};
