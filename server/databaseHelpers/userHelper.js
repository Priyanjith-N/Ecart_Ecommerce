const wishlist = require('../model/userSide/wishlist');

module.exports = {
    addProductToWishList: async (req) => {
        try {
            return await wishlist.updateOne({userId: req.session.isUserAuth}, {$push: {
                products: req.params.productId
            }});
        } catch (err) {
            return err;
        }
    }
}