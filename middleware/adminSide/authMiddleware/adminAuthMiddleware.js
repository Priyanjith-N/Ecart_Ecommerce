const adminHelper = require("../../../server/databaseHelpers/adminHelper");

module.exports = {
    isAdminAuth: (req, res, next) => {
        if(req.session.isAdminAuth){
            next();
        }else{
            res.status(401).redirect('/adminLogin');
        }
    },
    noAdminAuth: (req, res, next) => {
        if(req.session.isAdminAuth){
            res.status(401).redirect('/adminHome');
        }else{
            next();
        }
    },
    onlyOneReferal: async (req, res, next) => {
        try {
            const referralOffers = await adminHelper.referralOffers();
            
            if(!referralOffers || referralOffers.length === 0){
                return next();
            }

            req.flash("referralErr", "Only one Refferal Can be Added");

            res.status(401).redirect('/adminReferralOfferManagement');
        } catch (err) {
            console.error('add referral middleware in offer', err);
            res.status(500).res.send('Internal server err');
        }
    }
}