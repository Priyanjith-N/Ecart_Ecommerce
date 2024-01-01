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
const CsvParser = require('json2csv').Parser;
const axios = require('axios');

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
          $unwind: {
            path: "$orderItems",
          },
        },
        {
          $match: {
            "orderItems.orderStatus": "Ordered",
          },
        },
        {
          $count: "newOrders",
        },
      ]);
      const [tSalary] = await Orderdb.aggregate([
        {
          $unwind: {
            path: "$orderItems",
          },
        },
        {
          $match: {
            $or: [
              { "orderItems.orderStatus": "Delivered" },
              { paymentMethode: "onlinePayment" },
            ],
          },
        },
        {
          $group: {
            _id: null,
            tSalary: {
              $sum: {
                $multiply: ["$orderItems.lPrice", "$orderItems.quantity"],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);

      res.json({
        userCount,
        newOrders: newOrders?.newOrders,
        tSalary: tSalary?.tSalary,
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
          unlistedProduct: Number(req.params.value) ? false : true,
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
    ];

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
    if (req.query.Search) {
      const result = await Categorydb.find({
        name: { $regex: req.query.Search, $options: "i" },
        status: Number(req.params.value) ? true : false,
      });
      return res.send(result);
    }
    const result = await Categorydb.find({
      status: Number(req.params.value) ? true : false,
    });
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
    const data = await Productdb.updateOne(
      { _id: req.params.id },
      { $set: { unlistedProduct: true } }
    );

    res.redirect("/adminProductManagement");
  },
  adminRestoreProduct: async (req, res) => {
    const data = await Productdb.updateOne(
      { _id: req.params.id },
      { $set: { unlistedProduct: false } }
    );

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
      newlyLauch: req.body.newlyLanch ? true : false,
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
      if (req.query.Search) {
        const result = await Userdb.find({
          $or: [
            { fullName: { $regex: req.query.Search, $options: "i" } },
            { email: { $regex: req.query.Search, $options: "i" } },
          ],
        });
        return res.send(result);
      }
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

    if (filter === "undefined" || filter === "All" || !filter) {
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
          $lookup: {
            from: "userdbs",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $lookup: {
            from: "uservariationdbs",
            localField: "userId",
            foreignField: "userId",
            as: "userVariations",
          },
        },
        {
          $sort: {
            orderDate: -1,
          },
        },
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
          $lookup: {
            from: "userdbs",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $lookup: {
            from: "uservariationdbs",
            localField: "userId",
            foreignField: "userId",
            as: "userVariations",
          },
        },
        {
          $sort: {
            orderDate: -1,
          },
        },
      ];
    }

    const orderedItems = await Orderdb.aggregate(agg);

    res.send(orderedItems);
  },
  adminChangeOrderStatus: async (req, res) => {
    await Orderdb.updateOne(
      { "orderItems._id": req.params.orderId },
      { $set: { "orderItems.$.orderStatus": req.body.orderStatus } }
    );
    if (!req.body.filter) {
      return res.status(200).redirect("/adminOrderManagement");
    }
    res.status(200).redirect(`/adminOrderManagement?filter=${req.body.filter}`);
  },
  downloadSalesReport: async (req, res) => {
    try {
      const users = [];

      const order = await axios.post(`http://localhost:${process.env.PORT}/api/getAllcartItemsWithFilter`); // to get total orders

      const details = await axios.get(
        `http://localhost:${process.env.PORT}/api/userCount` // to attain user count , sales total
      );

      let count = 1;

      order.data.forEach(orders => {
        orders.sI = count;
        users.push({"SI": orders.sI,"Orders ID": orders._id, "Order Date": orders.orderDate.split('T')[0],"Product Name": orders.orderItems.pName, "Price of a unit": orders.orderItems.lPrice, "Qty": orders.orderItems.quantity, "Payment Method": orders.paymentMethode,"Total amount": (orders.orderItems.quantity * orders.orderItems.lPrice)}); 
        count++;
      });

      // users.push({"": "Total NO of orders", "Total NO of users": details.data.userCount, "Total Sales": details.data.tSalary}); // here data is stored

      const csvFields = ["SI", "Orders ID", "Order Date","Product Name", "Price of a unit", "Qty", "Payment Method","Total amount"];

      const csvParser = new CsvParser({csvFields});
      const csvData = csvParser.parse(users);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attatchment: filename=salesReport.csv");

      res.status(200).end(csvData);

    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server err');
    }
  },
  getDetailsChart: async (req, res) => {
    try {
      let labelObj = {};
      let salesCount;
      let findQuerry;
      let currentYear;
      let currentMonth;
      let index;

      switch (req.body.filter) {
        case "Weekly":
          currentYear = new Date().getFullYear();
          currentMonth = new Date().getMonth() + 1;

          labelObj = {
            "Sun": 0,
            "Mon": 1,
            "Tue": 2,
            "Wed": 3,
            "Thu": 4,
            "Fri": 5,
            "Sat": 6,
          };

          salesCount = new Array(7).fill(0);

          findQuerry = {
            orderDate: {
              $gte: new Date(currentYear, currentMonth - 1, 1),
              $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
            }
          };
          index = 0;
          break;
        case "Monthly":
          currentYear = new Date().getFullYear();
          labelObj = {
            "Jan": 0,
            "Feb": 1,
            "Mar": 2,
            "Apr": 3,
            "May": 4,
            "Jun": 5,
            "Jul": 6,
            "Aug": 7,
            "Sep": 8,
            "Oct": 9,
            "Nov": 10,
            "Dec": 11,
          }

          salesCount = new Array(12).fill(0);

          findQuerry = {
            orderDate: {
              $gte: new Date(currentYear, 0, 1), 
              $lte: new Date(currentYear, 11, 31, 23, 59, 59), 
            }
          }
          index = 1;
          break;
          case "Daily":
            currentYear = new Date().getFullYear();
            currentMonth = new Date().getMonth() + 1;
            let end = new Date(currentYear, currentMonth, 0, 23, 59, 59);
            end = String(end).split(' ')[2];
            end = Number(end);

            for(let i = 0; i < end; i++){
              labelObj[`${i + 1}`] = i;
            }

            salesCount = new Array(end).fill(0);

            findQuerry = {
              orderDate: {
                $gt: new Date(currentYear, currentMonth - 1, 1),
                $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
              }
            };
            
            index = 2;
            break;
          case "Yearly":
            findQuerry = {}

            const ord = await Orderdb.find().sort({orderDate: 1});
            const stDate = ord[0].orderDate.getFullYear();
            const endDate = ord[ord.length - 1].orderDate.getFullYear();

            for(let i = 0; i <= (Number(endDate) - Number(stDate)); i++){
              labelObj[`${stDate + i}`] = i;
            }

            salesCount = new Array(Object.keys(labelObj).length).fill(0);

            index = 3;
            break;
        default:
          return res.json({
            label: [],
            salesCount: []
          });
      }

      const orders = await Orderdb.find(findQuerry);

      orders.forEach(order => {
        if(index === 2){
          salesCount[labelObj[Number(String(order.orderDate).split(' ')[index])]] += 1;
        }else{
          salesCount[labelObj[String(order.orderDate).split(' ')[index]]] += 1;
        }
      });

      res.json({
        label: Object.keys(labelObj),
        salesCount
      });
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server err');
    }
  }
};
