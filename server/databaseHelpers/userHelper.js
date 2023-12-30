const Wishlistdb = require('../model/userSide/wishlist');
const Productdb = require('../model/adminSide/productModel').Productdb;

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
    }
}