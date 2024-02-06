const adminHelper = require('../../databaseHelpers/adminHelper');

module.exports = {
    adminAddCoupon: async (req, res) => {
        try {
            req.body.code = req.body.code?.trim();
            req.body.code = req.body.code?.toUpperCase();
            req.body.category = req.body.category?.trim();
            req.body.discount = req.body.discount?.trim();
            req.body.count = req.body.count?.trim();
            req.body.minPrice = req.body.minPrice?.trim();
            req.body.expiry = req.body.expiry?.trim();

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

            if(req.body.discount && req.body.discount < 0){
                req.session.discount = `Discount Should be in between 0 - 95%`;
            }

            if(req.body.code){
                const isExisting = await adminHelper.adminCheckIfCouponExist(req.body.code);
                if(isExisting){
                    req.session.code = 'This coupon already exist';
                }
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
    adminUpdateCoupon: async (req, res) => {
        try {
            req.body.code = req.body.code?.trim();
            req.body.code = req.body.code?.toUpperCase();
            req.body.category = req.body.category?.trim();
            req.body.discount = req.body.discount?.trim();
            req.body.count = req.body.count?.trim();
            req.body.minPrice = req.body.minPrice?.trim();
            req.body.expiry = req.body.expiry?.trim();

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

            if(req.body.discount && req.body.discount < 0){
                req.session.discount = `Discount Should be in between 0 - 95%`;
            }

            if(req.body.code){
                const isExisting = await adminHelper.adminCheckIfCouponExist(req.body.code, req.params.couponId);
                if(isExisting){
                    req.session.code = 'This coupon already exist';
                }
            }

            if(req.session.code || req.session.category || req.session.discount || req.session.count || req.session.minPrice || req.session.expiry){
                req.session.savedDetails = req.body;
                return res.status(401).json({
                    url:`/adminUpdateCoupon/${req.params.couponId}`,
                    status: true
                });
            }

            await adminHelper.adminUpdateCoupon(req.params.couponId, req.body);

            res.status(200).json({
                url: '/adminCouponManagement',
                status: true,
            });
        } catch (err) {
            console.error('coupon controller err in add coupon', err);
            res.status(500).json({
                message: 'Internal server err',
                errStatus: true,
            });
        }
    },
    adminDeleteCoupon: async (req, res) => {
        try {
            //adminHelper fn to delete coupon from admin side
            await adminHelper.adminDeleteCoupon(req.params.couponId);

            res.status(200).json({
                url: '/adminCouponManagement',
                status: true,
            });
        } catch (err) {
            console.error('coupon controller err in delete coupon', err);
            res.status(500).json({
                message: 'Internal server err',
                errStatus: true,
            });
        }
    }
}