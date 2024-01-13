const categorydb = require('../model/adminSide/category').Categorydb;
const { default: mongoose } = require('mongoose');
const bannerdb = require('../model/adminSide/bannerModel');
const Orderdb = require('../model/userSide/orderModel');
const Productdb = require('../model/adminSide/productModel').Productdb;
const ProductVariationdb = require('../model/adminSide/productModel').ProductVariationdb;

module.exports = {
    getCategorydb: async (status) => {
        try {
            return await categorydb.find({status});
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
    }
}