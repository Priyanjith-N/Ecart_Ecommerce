const adminEmail = `admin@gmail.com`;
const adminPassword = `123`;

const mongodb = require("mongoose");
const Userdb = require("../../model/userSide/userModel");
const Productdb = require("../../model/adminSide/productModel").Productdb;
const UlistedProductdb =
  require("../../model/adminSide/productModel").UlistedProductdb;
const ProductVariationdb =
  require("../../model/adminSide/productModel").ProductVariationdb;
const UnlistedProductVariationdb =
  require("../../model/adminSide/productModel").UnlistedProductVariationdb;
const Categorydb = require("../../model/adminSide/category").Categorydb;
const fs = require("fs");
const path = require("path");

module.exports = {
  adminLogin: (req, res) => {
    if(!req.body.email){
      req.session.adminEmail = `This Field is required`
    }

    if(!req.body.password){
      req.session.adminPassword = `This Field is required`
    }

    if(req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)){
      req.session.adminEmail = `Not a valid Gmail address`
    }

    if (req.session.adminEmail || req.session.adminPassword) {
      return res.status(401).redirect('/adminLogin');
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
      res.send(`${userCount}`);
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
    const result = await Productdb.aggregate([
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
  },
  adminAddCategory: async (req, res) => {
    try {
      if (!req.body.name) {
        req.session.errMesg = `This Field is required`;
        return res.status(200).redirect("/adminAddCategory");
      }
      const newCat = new Categorydb(req.body);

      const result = await newCat.save();

      res.status(200).redirect("/adminCategoryManagement");
    } catch (err) {
      req.session.errMesg = `Category already exist`;
      res.status(401).redirect("/adminAddCategory");
    }
  },
  getCategory: async (req, res) => {
    if (Number(req.params.value) === 1) {
      const result = await Categorydb.find({ status: true });
      res.send(result);
    } else {
      const result = await Categorydb.find({ status: false });
      res.send(result);
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
    const data = await Productdb.findOneAndDelete({ _id: req.params.id });

    const dataVariations = await ProductVariationdb.findOneAndDelete({
      productId: req.params.id,
    });

    res.redirect("/adminProductManagement");

    const newDeleted = new UlistedProductdb({
      pName: data.pName,
      category: data.category,
      sTittle: data.sTittle,
      hDescription: data.hDescription,
      pDescription: data.pDescription,
      fPrice: data.fPrice,
      lPrice: data.lPrice,
      newlyLauch: data.newlyLauch,
    });

    const result = await newDeleted.save();

    const newDeletedVariations = new UnlistedProductVariationdb({
      productId: result._id,
      color: dataVariations.color,
      quantity: dataVariations.quantity,
      images: dataVariations.images,
    });

    await newDeletedVariations.save();
  },
  showUnlistedProduct: async (req, res) => {
    const result = await UlistedProductdb.aggregate([
      {
        $lookup: {
          from: "unlistedproductvariationdbs",
          localField: "_id",
          foreignField: "productId",
          as: "variations",
        },
      },
    ]);

    res.send(result);
  },
  adminRestoreProduct: async (req, res) => {
    const data = await UlistedProductdb.findOneAndDelete({
      _id: req.params.id,
    });

    const dataVariations = await UnlistedProductVariationdb.findOneAndDelete({
      productId: req.params.id,
    });

    res.redirect("/adminUnlistedProduct");

    const newDeleted = new Productdb({
      pName: data.pName,
      category: data.category,
      sTittle: data.sTittle,
      hDescription: data.hDescription,
      pDescription: data.pDescription,
      fPrice: data.fPrice,
      lPrice: data.lPrice,
      newlyLauch: data.newlyLauch,
    });

    const result = await newDeleted.save();

    const newDeletedVariations = new ProductVariationdb({
      productId: result._id,
      color: dataVariations.color,
      quantity: dataVariations.quantity,
      images: dataVariations.images,
    });

    await newDeletedVariations.save();
  },
  getProduct: async (req, res) => {
    try {
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

    const filePath = path.join(
      __dirname,
      "../../../public",
      fileImg.images[req.query.index]
    );

    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });

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
      newlyLauch: req.body.newlyLanch,
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
      console.log('quer Err', err);
      res.status(401).send('Internal server err');
    }
  },
  adminUserStatus: async (req, res) => {
    if(!Number(req.params.block)){
      await Userdb.updateOne({_id: req.params.id}, {$set: {userStatus: false, userLstatus: false}});
      return res.status(200).redirect('/adminUserManagement');
    }
    await Userdb.updateOne({_id: req.params.id}, {$set: {userStatus: true}});
    res.status(200).redirect('/adminUserManagement');
  },
  adminUserDelete: async (req, res) => {
    try {
      await Userdb.deleteOne({_id: req.params.id});
      res.status(200).redirect('/adminUserManagement');
    } catch (err) {
      console.log('quer Err', err);
      res.status(401).send('Internal server err');
    }
  },
  adminLogout: (req, res) =>{
    req.session.destroy();
    res.status(200).redirect('/adminLogin');
  }
};
