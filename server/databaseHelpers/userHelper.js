const { default: mongoose } = require('mongoose');
const Wishlistdb = require('../model/userSide/wishlist');
const Productdb = require('../model/adminSide/productModel').Productdb;
const Orderdb = require('../model/userSide/orderModel');
const Userdb = require('../model/userSide/userModel');

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
            return err;
        }
    },
    getWishlistItems: async (userId) => {
        try {
            if(!userId){
                return null;
            }
            return await Wishlistdb.findOne({userId: userId});
        } catch (err) {
            return err;
        }
    },
    removeWishlistItems: async (userId,productId) => {
        try {
            if(!userId){
                return null;
            }
    
            return await Wishlistdb.updateOne({userId: userId}, {$pull: {products: productId}});
        } catch (err) {
            return err;
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
            return err;
        }
    },
    isOrdered: async (productId, userId, orderId = null) => {
        try {
            if(orderId){
                const isOrder = await Orderdb.findOne({_id: orderId,userId: userId, "orderItems.productId": productId, "orderItems.orderStatus": "Delivered"});

                let flag = 0;
                if(isOrder){
                    isOrder.orderItems.forEach(value => {
                        if(value.orderStatus != 'Delivered'){
                            flag = 1;
                        }
                    });

                    if(flag === 1){
                        return null;
                    }
                }

                return isOrder;
            }

            const isOrder = await Orderdb.findOne({userId: userId, "orderItems.productId": productId, "orderItems.orderStatus": "Delivered"});

            return isOrder;
        } catch (err) {
            return err;
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
            return err;
        }
    }
}