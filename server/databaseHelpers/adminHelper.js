const Categorydb = require('../model/adminSide/category').Categorydb;
const { default: mongoose, isObjectIdOrHexString } = require('mongoose');
const bannerdb = require('../model/adminSide/bannerModel');
const Orderdb = require('../model/userSide/orderModel');
const Productdb = require('../model/adminSide/productModel').Productdb;
const ProductVariationdb = require('../model/adminSide/productModel').ProductVariationdb;
const Userdb = require('../model/userSide/userModel');
const ReferralOfferdb = require('../model/adminSide/referralOfferModel');
const Coupondb = require('../model/adminSide/couponModel');
const UserWalletdb = require('../model/userSide/walletModel');

module.exports = {
    getCategorydb: async (search = null, status = true, page = 1, forSelectBox = false, categoryId = null) => {
        try {
            //for single category for updation
            if(categoryId){
                return await Categorydb.findOne({_id: categoryId})
            }
            const skip  = Number(page)?(Number(page) - 1):0;
            if(search){
                return await Categorydb.find({$and: [{name: { $regex: search, $options: "i" }},{status}]}).skip((skip * 10)).limit(10);
            }
            if(forSelectBox){
                return await Categorydb.find({status});
            }
            return await Categorydb.find({status}).skip((skip * 10)).limit(10);
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
    getBanner: async (status, page = 1) => {
        try {
            const skip = Number(page)?(Number(page) - 1):0;
            return await bannerdb.find({status}).skip((10 * skip)).limit(10);
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
                const qty = await Orderdb.findOne({$and: [{_id: new mongoose.Types.ObjectId(orderId)}, {'orderItems.productId': productId}]}, {'orderItems.$': 1, _id: 0, userId: 1});

                await UserWalletdb.updateOne({userId: qty.userId}, {
                    $inc: {
                        walletBalance: (qty.orderItems[0].quantity * qty.orderItems[0].lPrice)
                    },
                    $push: {
                        transtions: {
                            amount: (qty.orderItems[0].quantity * qty.orderItems[0].lPrice)
                        }
                    }
                }, {upsert: true});
                await ProductVariationdb.updateOne({productId: productId}, {$inc: {quantity: qty.orderItems[0].quantity}});
            }
            return await Orderdb.updateOne({$and:[{_id: new mongoose.Types.ObjectId(orderId)}, {"orderItems.productId": productId}]}, {$set:{"orderItems.$.orderStatus": orderStatus}});
        } catch (err) {
            throw err;
        }
    },
    getAllOrders: async (filter, page = 1, sales = null) => {
        try {
            const skip = Number(page)?(Number(page) - 1):0;
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
            if(filter && filter !== 'All'){
                agg.splice(1,0,{
                    $match: {
                        "orderItems.orderStatus": filter,
                    },
                });
            }

            if(!sales){
                agg.push({
                        $skip: (10 * skip)
                    },
                    {
                        $limit: 10
                    }
                );
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
                            {
                                $and: [
                                    { paymentMethode: "COD" },
                                    { "orderItems.orderStatus": "Delivered" }
                                ]
                            },
                            {
                                $and: [
                                    { paymentMethode: "onlinePayment" },
                                    { "orderItems.orderStatus": {$ne: "Cancelled"} }
                                ]
                            }
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
    adminGetAllUsers: async (search, page = 1) => {
        try {
            const skip = Number(page)?(Number(page) - 1):0;
            const agg = [
                {
                    $skip: (10 * skip)
                },
                {
                    $limit: 10
                }
            ];

            //if there is search filtered users
            if(search){
                agg.splice(0, 0, {
                    $match:{
                        $or: [
                            { fullName: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } },
                        ],
                    }
                });
            }
    
            return await Userdb.aggregate(agg);
        } catch (err) {
            throw err;
        }
    },
    getProductList: async (status = false, page = 1) => {
        try {
            const skip = Number(page)?(Number(page) - 1):0;
            // flase to return all listed product and true to return all unlisted product
            const agg = [
                {
                  $match: {
                    unlistedProduct: status,
                  },
                },
                {
                    $skip: (10 * skip)
                },
                {
                    $limit: 10
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
    },
    adminGetSingleProduct: async (productId) => {
        try {
            // querying to get full details of the selected product
            return await Productdb.aggregate([
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(productId),
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
        } catch (err) {
            throw err;
        }
    },
    adminPageNation: async (management, status = true) => {
        try {
            // to get total order number
            if(management === 'OM'){
                const tOrdersNo = await Orderdb.aggregate([
                    {
                        $unwind: {
                            path: "$orderItems",
                        },
                    },
                ]);

                return tOrdersNo.length;
            }

            // to get total number of users
            if(management === 'UM'){
                return await Userdb.countDocuments();
            }
            
            // to get count of category
            if(management === 'CM'){
                return (await Categorydb.find({status})).length;
            }

            // to get count of listed or unlisted product
            if(management === 'PM'){
                return (await Productdb.find({unlistedProduct: status})).length;
            }

            // to get count of listed or unlisted product
            if(management === 'BM'){
                return (await bannerdb.find({status})).length;
            }

            // to get count of listed or unlisted product
            if(management === 'CouponM'){
                return (await Coupondb.find()).length;
            }

        } catch (err) {
            throw err;
        }
    },
    addReferralOffer: async (body) => {
        try {
            const newReferralOffer = new ReferralOfferdb(body);
            return await newReferralOffer.save();
        } catch (err) {
            throw err;
        }
    },
    referralOffers: async (referralOfferId = null) => {
        try {
            if(referralOfferId){
                return await ReferralOfferdb.findOne({_id: referralOfferId});
            }
            return await ReferralOfferdb.find();
        } catch (err) {
            throw err;
        }
    },
    addCoupon: async (body) => {
        try {
            const newCoupon = new Coupondb(body);
            await newCoupon.save();
        } catch (err) {
            throw err;
        }
    },
    getAllCoupon: async (couponId = null, page = null) => {
        try {
            const skip = Number(page)?(Number(page) - 1):0;
            // for updation of coupon we need details of the perticular coupon
            if(couponId){
                if(!isObjectIdOrHexString(couponId)){
                    return null;
                }
                return await Coupondb.findOne({_id: couponId});
            }
            return await Coupondb.find().skip((10 * skip)).limit(10);
        } catch (err) {
            throw err;
        }
    },
    adminUpdateCoupon: async (couponId, body) => {
        try {
            // for updation of coupon we need details of the perticular coupon
            return await Coupondb.updateOne({_id: couponId}, body);
        } catch (err) {
            throw err;
        }
    },
    adminDeleteCoupon: async (couponId) => {
        try {
            // delete coupon form admin side 
            return await Coupondb.deleteOne({_id: couponId});
        } catch (err) {
            throw err;
        }
    },
    adminCheckIfCouponExist: async (code, couponId = false) => {
        try {
            // to check if the given code is already existing or not if the id is eq then it's same coupon
            if(couponId){
                return await Coupondb.findOne({_id: {$ne: couponId}, code});
            }
            return await Coupondb.findOne({code});
        } catch (err) {
            throw err;
        }
    },
    getSalesReport: async (fromDate, toDate, full) => {
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
            // get all details of sales report withn the given dates

            if(!full){
                agg.splice(0, 0, {
                    $match: {
                        $and: [
                            {
                                orderDate: {$gte: new Date(fromDate)}
                            },
                            {
                                orderDate: {$lte: new Date(new Date(toDate).getTime() + 1 * 24 * 60 * 60 * 1000)}
                            }
                        ]
                    }
                });
            }
            
            return await Orderdb.aggregate(agg);
        } catch (err) {
            throw err;
        }
    }
}