const Userdb = require('../../../server/model/userSide/userModel');
const userHelper = require('../../../server/databaseHelpers/userHelper');

module.exports = {
    otpVerify : (req, res, next) => {
        if(req.session.verifyOtpPage){
            next();
        }else{
            res.redirect('/userRegister');
        }
    },
    noOtpVerify : (req, res, next) => {
        if(req.session.verifyOtpPage){
            res.redirect('/userRegisterOtpVerify');
        }else{
            next();
        }
    },
    userLoginResetPassword: (req, res, next) => {
        if(req.session.resetPasswordPage) {
            next();
        }else{
            res.redirect('/userLogin');
        }
    },
    noUserLoginResetPassword: (req, res, next) => {
        if(req.session.resetPasswordPage) {
            res.redirect('/userLoginResetPassword');
        }else{
            next();
        }
    },
    isUserAuth: (req, res, next) => {
        if(req.session.isUserAuth){
            res.redirect('/');
        }else{
            next();
        }
    },
    isUserBlocked: async (req, res, next) => {
        try {
            if (!req.session.isUserAuth) {
                return next();
            }
            const data = await Userdb.findOne({_id: req.session.isUserAuth});

            if(!data.userStatus){
                req.session.userBlockedMesg = true;
                delete req.session.isUserAuth;
                return res.status(200).redirect('/userLogin');
            }
            next();
        } catch (err) {
            console.log('Middle ware err', err);
            res.status(401).send('You are block');
        }
    },
    isUserLoggedIn: (req, res, next) => {
        if(req.session.isUserAuth){
            next();
        }else{
            res.status(200).redirect('/userLogin');
        }
        
    },
    isAuthOrder: (req, res, next) => {
        if(req.session.orderSucessPage){
            next();
        }else{
            res.status(401).redirect('/');
        }
    },
    isDelivered: async(req, res, next) => {
        try {
            const isOrder = await userHelper.isOrdered(req.params.productId, req.session.isUserAuth);
            if(isOrder){
                return next();
            }
            req.flash('message', 'not purchased');
            res.status(200).redirect(`/userProductDetail/${req.params.productId}`);
        } catch (err) {
            console.log("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    }
}