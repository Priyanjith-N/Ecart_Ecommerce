const adminHelper = require('../../databaseHelpers/adminHelper');

module.exports = {
    adminAddCoupon: async (req, res) => {
        try {
            req.body.code = req.body.code.trim();
            req.body.category = req.body.category.trim();
            req.body.discount = req.body.discount.trim();
            req.body.count = req.body.count.trim();
            req.body.minPrice = req.body.minPrice.trim();
            req.body.expiry = req.body.expiry.trim();

            if(!req.body.code){
                req.session.code = `This Field is required`;
            }

            if(!req.body.category){
                req.session.category = `This Field is required`;
            }

            if(!req.body.discount){
                req.session.discount = `This Field is required`;
            }

            if(!req.body.count){
                req.session.count = `This Field is required`;
            }

            if(!req.body.minPrice){
                req.session.minPrice = `This Field is required`;
            }

            if(!req.body.expiry){
                req.session.expiry = `This Field is required`;
            }

            if(req.body.discount && req.body.discount > 95){
                req.session.discount = `Discount cannot be greater than 95%`;
            }

            if(req.session.code || req.session.category || req.session.discount || req.session.count || req.session.minPrice || req.session.expiry){
                req.session.savedDetails = req.body;
                return res.status(401).redirect('/adminAddCoupon');
            }

            await adminHelper.addCoupon(req.body);

            res.status(200).redirect('/adminCouponManagement');
        } catch (err) {
            console.error('coupon controller err in add coupon', err);
            res.status(500).send('Internal server err');
        }
    },
}