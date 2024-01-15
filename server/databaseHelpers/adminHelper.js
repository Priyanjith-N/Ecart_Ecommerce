const Categorydb = require('../model/adminSide/category').Categorydb;
const { default: mongoose } = require('mongoose');
const bannerdb = require('../model/adminSide/bannerModel');
const Orderdb = require('../model/userSide/orderModel');
const Productdb = require('../model/adminSide/productModel').Productdb;
const ProductVariationdb = require('../model/adminSide/productModel').ProductVariationdb;
const Userdb = require('../model/userSide/userModel');

module.exports = {
    getCategorydb: async (search = null, status = true) => {
        try {
            if(search){
                return await Categorydb.find({$and: [{name: { $regex: search, $options: "i" }},{status}]});
            }
            return await Categorydb.find({status});
        } catch (err) {
            throw err;
        }
    },
    addBanner: async (body, largeImg, smallImg) => {
        try {
            const newBanner = new bannerdb({
                name: body.bName,
                description: body.bDescription,
                category: body.category,
                largeScreenImage: largeImg,
                smallScreenImage: smallImg
            });

            return await newBanner.save();
        } catch (err) {
            throw err;
        } 
    },
    getBanner: async (status) => {
        try {
            return await bannerdb.find({status});
        } catch (err) {
            throw err;
        }
    },
    adminDeleteBanner: async (bannerId, status) => {
        try {
            return await bannerdb.updateOne({_id: bannerId}, {$set: {status: status}});
        } catch (err) {
            throw err;
        }
    },
    adminPremenentDeleteBanner: async (bannerId) => {
        try {
            return await bannerdb.deleteOne({_id: bannerId});
        } catch (err) {
            throw err;
        }
    },
    adminChangeOrderStatus: async (orderId, productId, orderStatus) => {
        try {
            if(orderStatus === 'Cancelled'){
                const qty = await Orderdb.findOne({$and: [{_id: new mongoose.Types.ObjectId(orderId)}, {'orderItems.productId': productId}]}, {'orderItems.$': 1, _id: 0});
                await ProductVariationdb.updateOne({productId: productId}, {$inc: {quantity: qty.orderItems[0].quantity}});
            }
            return await Orderdb.updateOne({$and:[{_id: new mongoose.Types.ObjectId(orderId)}, {"orderItems.productId": productId}]}, {$set:{"orderItems.$.orderStatus": orderStatus}});
        } catch (err) {
            throw err;
        }
    },
    getAllOrders: async (filter) => {
        try {
            const agg = [
                {
                  $unwind: {
                    path: "$orderItems",
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

            //if there is filter it will add another stage in aggregation match
            if(filter){
                agg.splice(1,0,{
                    $match: {
                        "orderItems.orderStatus": filter,
                    },
                });
            }

            // return all documents after aggregating
            return await Orderdb.aggregate(agg);
        } catch (err) {
            throw err;
        }
    },
    getAllDashCount: async () => {
        try {

            //returns total user count
            const userCount = await Userdb.countDocuments();

            // retuns count of orders in newOrders Field
            const [ orders ] = await Orderdb.aggregate([
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

            //return total Sales amount
            const [ totalSales ] = await Orderdb.aggregate([
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

            // return an object with all counts for admin dashboard
            return {
                userCount,
                newOrders: orders?.newOrders,
                tSalary: totalSales?.tSalary,
            }
        } catch (err) {
            throw err;
        }
    },
    adminGetAllUsers: async (search) => {
        try {
            //if there is search filtered users
            if(search){
                return await Userdb.find({
                    $or: [
                      { fullName: { $regex: search, $options: "i" } },
                      { email: { $regex: search, $options: "i" } },
                    ],
                });
            }
    
            return await Userdb.find();
        } catch (err) {
            throw err;
        }
    },
    getProductList: async (status = false) => {
        try {
            // flase to return all listed product and true to return all unlisted product
            const agg = [
                {
                  $match: {
                    unlistedProduct: status,
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
            return await Productdb.aggregate(agg);
        } catch (err) {
            throw err;
        }
    }
}