const Userdb = require('../../../server/model/userSide/userModel');
const userHelper = require('../../../server/databaseHelpers/userHelper');

module.exports = {
    otpVerify : (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;
            
            if(req.session.verifyOtpPage){
                next();
            }else{
                res.redirect('/userRegister');
            }
        } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    noOtpVerify : (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            if(req.session.verifyOtpPage){
                res.redirect('/userRegisterOtpVerify');
            }else{
                next();
            }
        } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    userLoginResetPassword: (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            if(req.session.resetPasswordPage) {
                next();
            }else{
                res.redirect('/login');
            }
        } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    noUserLoginResetPassword: (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            if(req.session.resetPasswordPage) {
                res.redirect('/userLoginResetPassword');
            }else{
                next();
            }
        } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    isUserAuth: (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            if(req.session.isUserAuth){
                res.redirect('/');
            }else{
                next();
            }
        } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    isUserBlocked: async (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            if (!req.session.isUserAuth) {
                return next();
            }
            const data = await Userdb.findOne({_id: req.session.isUserAuth});

            if(!data.userStatus){
                req.session.userBlockedMesg = true;
                delete req.session.isUserAuth;
                return res.status(200).redirect('/login');
            }
            next();
        } catch (err) {
            console.error('Middle ware err', err);
            res.status(401).send('You are block');
        }
    },
    isUserLoggedIn: (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            if(req.session.isUserAuth){
                next();
            }else{
                res.status(200).redirect('/login');
            }
        } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    isAuthOrder: (req, res, next) => {
       try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            if(req.session.orderSucessPage){
                next();
            }else{
                res.status(401).redirect('/');
            }
       } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
       }
    },
    isDelivered: async(req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            const isOrder = await userHelper.isOrdered(req.params.productId, req.session.isUserAuth);
            if(isOrder){
                return next();
            }
            req.flash('message', 'not purchased');
            res.status(200).redirect(`/userProductDetail/${req.params.productId}`);
        } catch (err) {
            console.error("Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    },
    simpleFindErrMiddleWare: (req, res, next) => {
        try {
            // this session is to identify which side is the get err
            req.session.adminPageErr = false;

            return next();
        } catch (err) {
            console.error("Simple Middleware err:", err);
            res.status(500).render("errorPages/500ErrorPage");
        }
    }
}