const { default: mongoose } = require('mongoose');
const Wishlistdb = require('../model/userSide/wishlist');
const Productdb = require('../model/adminSide/productModel').Productdb;
const Orderdb = require('../model/userSide/orderModel');
const Userdb = require('../model/userSide/userModel');
const { ProductVariationdb } = require('../model/adminSide/productModel');

module.exports = {
    addProductToWishList: async (userId, productId) => {
        try {
            const product = await Productdb.findOne({_id: productId});

            if(!product) {
                return;
            }

            return await Wishlistdb.updateOne({userId: userId}, {$push: {
                products: productId
            }}, { upsert: true });
        } catch (err) {
            throw err;
        }
    },
    getWishlistItems: async (userId) => {
        try {
            if(!userId){
                return null;
            }
            return await Wishlistdb.findOne({userId: userId});
        } catch (err) {
            throw err;
        }
    },
    removeWishlistItems: async (userId,productId) => {
        try {
            if(!userId){
                return null;
            }
    
            return await Wishlistdb.updateOne({userId: userId}, {$pull: {products: productId}});
        } catch (err) {
            throw err;
        }
    },
    getSingleProducts: async (productId = null) => {
        try {
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
    isOrdered: async (productId, userId, orderId = null) => {
        try {
            if(orderId){
                const isOrder = await Orderdb.findOne({_id: orderId,userId: userId, "orderItems.productId": productId, "orderItems.orderStatus": "Delivered"});

                if(!isOrder){
                    return null;
                }

                const dOrders = isOrder.orderItems.filter(value => (value.orderStatus) === 'Delivered' );

                if(dOrders.length === 0){
                    return null;
                }
                
                isOrder.orderItems = dOrders;

                return isOrder;
            }

            const isOrder = await Orderdb.findOne({userId: userId, "orderItems.productId": productId, "orderItems.orderStatus": "Delivered"});

            return isOrder;
        } catch (err) {
            throw err;
        }
    },
    userInfo: async (userId) => {
        try {
            const agg = [
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(userId),
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
              return user[0];
        } catch (err) {
            throw err;
        }
    },
    userOrderCancel: async (orderId, productId) => {
        try {
            //updating orderStatus to cancelled
            const order = await Orderdb.findOneAndUpdate({
                $and:[
                    {_id: orderId}, {"orderItems.productId": productId}
                ]
            },
            {$set: {
                "orderItems.$.orderStatus": "Cancelled"
            }});

            // find the product doc to get the qty ordered
            const qty = order.orderItems.find(value => {
                if(String(value.productId) === productId){
                    return value.quantity;
                }
            })

            // updating product quantity
            await ProductVariationdb.updateOne({productId: productId},
                {$inc:{
                    quantity: qty.quantity
                }});

            return;
        } catch (err) {
            throw err;
        }
    }
}