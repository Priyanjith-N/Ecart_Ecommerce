const userHelper = require('../../databaseHelpers/userHelper');

module.exports = {
    addToWishlist: async (req, res) => {
        try {
            await userHelper.addProductToWishList(req.session.isUserAuth, req.params.productId);

            return res.status(200).json({
                status: true,
                message: 'Item added to Wishlist'
            });
        } catch (err) {
            console.log("addToWhishlistErr",err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    deleteFromWishlist: async (req, res) => {
        try {
            await userHelper.removeWishlistItems(req.session.isUserAuth, req.params.productId);

            return res.status(200).json({
                status: true,
                message: 'Item removed from Wishlist'
            });
        } catch (err) {
            console.log("addToWhishlistErr",err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    }
}