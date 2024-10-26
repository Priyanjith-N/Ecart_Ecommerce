const adminEmail = process.env.adminEmail;
const adminPassword = process.env.adminPass;

const mongodb = require("mongoose");
const Userdb = require("../../model/userSide/userModel");
const Productdb = require("../../model/adminSide/productModel").Productdb;
const ProductVariationdb =
  require("../../model/adminSide/productModel").ProductVariationdb;
const Categorydb = require("../../model/adminSide/category").Categorydb;
const Orderdb = require("../../model/userSide/orderModel");
const fs = require("fs");
const path = require("path");
const CsvParser = require("json2csv").Parser;
const adminHelper = require("../../databaseHelpers/adminHelper");
const puppeteer = require("puppeteer-core");
const ejs = require('ejs')

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

      req.body.pName = capitalizeFirstLetter(req.body.pName);
      req.body.category = capitalizeFirstLetter(req.body.category);
      req.body.subTittle = capitalizeFirstLetter(req.body.subTittle);
      req.body.dheading = capitalizeFirstLetter(req.body.dheading);
      req.body.pDescription = capitalizeFirstLetter(req.body.pDescription);

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
  adminAddCategory: async (req, res) => {
    try {
      req.body.description = req.body.description.trim();
      req.body.name = req.body.name.trim();

      if(!req.body.description){
        req.session.dErr = `This Field is required`;
      }

      if (!req.body.name) {
        req.session.catErr = `This Field is required`;
      }

      if(req.session.dErr || req.session.catErr){
        req.session.sDetails = req.body;
        return res.status(200).redirect("/adminAddCategory");
      }

      req.body.name = capitalizeFirstLetter(req.body.name);
      req.body.description = capitalizeFirstLetter(req.body.description);
      const newCat = new Categorydb(req.body);

      await newCat.save();

      res.status(200).redirect("/adminCategoryManagement");
    } catch (err) {
      req.session.sDetails = req.body;
      req.session.catErr = `Category already exist`;
      res.status(401).redirect("/adminAddCategory");
    }
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
  adminChangeOrderStatus: async (req, res) => {
    try {
      //function to change order status for admin
      await adminHelper.adminChangeOrderStatus(req.params.orderId, req.params.productId, req.body.orderStatus);

      //check for filter
      if (!req.body.filter) {
        return res.status(200).redirect("/adminOrderManagement");
      }

      if(Number(req.body.page)){
        return res.status(200).redirect(`/adminOrderManagement?filter=${req.body.filter}&page=${req.body.page}`);
      }
      res.status(200).redirect(`/adminOrderManagement?filter=${req.body.filter}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server err");
    }
  },
  downloadSalesReport: async (req, res) => {
    try {
      const browser = await puppeteer.launch({
        headless: "new",
        executablePath: '/usr/bin/chromium-browser',
      });

      const order = await adminHelper.getSalesReport(req.body.fromDate, req.body.toDate, req.body.full);
      //for pdf download
      if(req.body.type === 'pdf'){

        const salesTemplate = fs.readFileSync(
          path.join(__dirname, "../../../views/adminSide/salesPDF.ejs"),
          "utf-8"
        );

        const renderedTemplate = ejs.render(salesTemplate, { order, fromDate: req.body.fromDate, toDate: req.body.toDate, total: req.body.full });

        const page = await browser.newPage();

        await page.setContent(renderedTemplate);

        const pdfBuffer = await page.pdf({
          format: 'A4',
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=salesReport.pdf");

        res.end(pdfBuffer);

        await browser.close();
        return;
      }

      const users = [];

      //adminHelper fn to get all product if filter then filtered product
      // const order = await adminHelper.getAllOrders(req.query.filter, null, true);

      //adminHelper fn to get all counts of user, newOrders and total sales
      const details = await adminHelper.getAllDashCount();

      let count = 1;

      order.forEach((orders) => {
        orders.sI = count;
        users.push({
          SI: orders.sI,
          "Orders ID": orders._id,
          "Order Date": orders.orderDate.toISOString().split("T")[0],
          "Product Name": orders.orderItems.pName,
          "Price of a unit": Math.round(((orders.orderItems.lPrice * orders.orderItems.quantity) - (orders.orderItems.offerDiscountAmount + orders.orderItems.couponDiscountAmount)) / orders.orderItems.quantity),
          Qty: orders.orderItems.quantity,
          "Payment Method": orders.paymentMethode,
          "Total amount": (orders.orderItems.quantity * orders.orderItems.lPrice - (orders.orderItems.offerDiscountAmount + orders.orderItems.couponDiscountAmount)),
        });
        count++;
      });

      const totalSales = order.reduce((total, value) => {
        if(((value.paymentMethode === 'onlinePayment') && (value.orderItems.orderStatus !== 'Cancelled'))){
          return total += ((value.orderItems.quantity * value.orderItems.lPrice) - (value.orderItems.offerDiscountAmount + value.orderItems.couponDiscountAmount));
        }

        if(((value.paymentMethode === 'COD') && (value.orderItems.orderStatus === 'Delivered'))){
          return total += ((value.orderItems.quantity * value.orderItems.lPrice) - (value.orderItems.offerDiscountAmount + value.orderItems.couponDiscountAmount));
        }

        return total;
      }, 0);

      const csvFields = [
        "SI",
        "Orders ID",
        "Order Date",
        "Product Name",
        "Price of a unit",
        "Qty",
        "Payment Method",
        "Total amount",
      ];

      if(!order || order?.length === 0){
        users.push({
          "SI": 'No Sales',
          "Orders ID": '',
          "Order Date": '',
          "Product Name": '',
          "Price of a unit": '',
          "Qty": '',
          "Payment Method": '',
          "Total amount": '',
        });
      }

      const csvParser = new CsvParser({ csvFields });
      let csvData = csvParser.parse(users);

      if(order && order.length !== 0){
        csvData += `\n\n\n,,,"Total Sales",${totalSales},,,`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attatchment: filename=salesReport.csv"
      );

      res.status(200).end(csvData);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server err");
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
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
          };

          salesCount = new Array(7).fill(0);

          findQuerry = {
            orderDate: {
              $gte: new Date(currentYear, currentMonth - 1, 1),
              $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
            },
          };
          index = 0;
          break;
        case "Monthly":
          currentYear = new Date().getFullYear();
          labelObj = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          };

          salesCount = new Array(12).fill(0);

          findQuerry = {
            orderDate: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          };
          index = 1;
          break;
        case "Daily":
          currentYear = new Date().getFullYear();
          currentMonth = new Date().getMonth() + 1;
          let end = new Date(currentYear, currentMonth, 0, 23, 59, 59);
          end = String(end).split(" ")[2];
          end = Number(end);

          for (let i = 0; i < end; i++) {
            labelObj[`${i + 1}`] = i;
          }

          salesCount = new Array(end).fill(0);

          findQuerry = {
            orderDate: {
              $gt: new Date(currentYear, currentMonth - 1, 1),
              $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
            },
          };

          index = 2;
          break;
        case "Yearly":
          findQuerry = {};

          const ord = await Orderdb.find().sort({ orderDate: 1 });
          const stDate = ord[0].orderDate.getFullYear();
          const endDate = ord[ord.length - 1].orderDate.getFullYear();

          for (let i = 0; i <= Number(endDate) - Number(stDate); i++) {
            labelObj[`${stDate + i}`] = i;
          }

          salesCount = new Array(Object.keys(labelObj).length).fill(0);

          index = 3;
          break;
        default:
          return res.json({
            label: [],
            salesCount: [],
          });
      }

      const orders = await Orderdb.find(findQuerry);

      orders.forEach((order) => {
        if (index === 2) {
          salesCount[
            labelObj[Number(order.orderDate.toISOString().split('-')[index].split('T')[0])]
          ] += 1;
        } else {
          salesCount[labelObj[String(order.orderDate).split(" ")[index]]] += 1;
        }
      });

      res.json({
        label: Object.keys(labelObj),
        salesCount,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server err");
    }
  },
};
