const adminHelper = require("../../../server/databaseHelpers/adminHelper");

module.exports = {
    isAdminAuth: (req, res, next) => {
        try {
            //this session is for to identify which side the get err is occuring
            req.session.adminPageErr = true;

            if(req.session.isAdminAuth){
                next();
            }else{
                res.status(401).redirect('/adminLogin');
            }
        } catch (err) {
            console.error('adminMiddleWare err',err);
            res.status(500).send('Intenal Server err');
        }
    },
    noAdminAuth: (req, res, next) => {
        try {
            //this session is for to identify which side the get err is occuring
            req.session.adminPageErr = true;

            if(req.session.isAdminAuth){
                res.status(401).redirect('/adminHome');
            }else{
                next();
            }
        } catch (err) {
            console.error('adminMiddleWare err',err);
            res.status(500).send('Intenal Server err');
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