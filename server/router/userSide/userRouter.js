const express = require('express');

const router = express.Router();

const userRender = require('../../services/userSide/userRender');
const userController = require('../../controller/userSide/userController');
const authMiddleware = require('../../../middleware/userSide/authMiddleware/authMiddleware');

router.get('/', authMiddleware.isUserBlocked, authMiddleware.noUserLoginResetPassword, userRender.homePage);

router.get('/userLogin', authMiddleware.isUserAuth, authMiddleware.noUserLoginResetPassword, authMiddleware.noUserRegisterVerify, userRender.userLogin);

router.post('/userLogin', userController.userLogin);

router.get('/userForgotPassword', authMiddleware.isUserAuth,authMiddleware.noUserLoginResetPassword, userRender.userForgotPassword); // frogot pass get

router.post('/userLoginEmailVerify', userController.userLoginEmailVerify);

router.post('/userLoginOtpVerify', userController.userLoginOtpVerify);

router.get('/userLoginEmailVerifyResend',  userController.userLoginEmailVerifyResend);

router.get('/userLoginResetPassword', authMiddleware.userLoginResetPassword, userRender.userResetPassword); // rest page

router.post('/userLoginResetPassword', userController.userLoginResetPass);

router.get('/userRegisterEmailVerify', authMiddleware.isUserAuth,authMiddleware.noUserLoginResetPassword, authMiddleware.noUserRegisterVerify,userRender.userEmailVerify);

router.post('/userRegisterEmailVerify', userController.userRegisterEmailVerify);

router.get('/userRegisterOtpVerify', authMiddleware.otpVerify, userRender.userRegisterOtpVerify);

router.post('/userRegisterOtpVerify', userController.userRegisterOtpVerify);

router.get('/userRegisterEmailVerifyResend', authMiddleware.noUserRegisterVerify,userController.userRegisterEmailVerifyResend);

router.get('/userRegister', authMiddleware.userRegisterVerify, userRender.userRegister);

router.post('/userRegister', userController.userRegister);

router.get('/Category/:category', authMiddleware.isUserBlocked, userRender.showProductsCategory);

router.get('/userProductDetail/:id', authMiddleware.isUserBlocked, userRender.userProductDetails);

router.get('/usersAddToCart', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.usersAddToCart);

router.get('/userCartNow/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userCartNow);

router.get('/userCartDelete/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userCartDelete);

router.get('/userCartItemUpdate/:productId/:values', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userCartItemUpdate);

router.get('/userAccount', authMiddleware.isUserLoggedIn,authMiddleware.isUserBlocked, userRender.userProfile);

router.get('/userUpdateAccount', authMiddleware.isUserLoggedIn,authMiddleware.isUserBlocked, userRender.userUpdateAccount);

router.post('/userUpdateAccount', authMiddleware.isUserLoggedIn, userController.userUpdateAccount);

router.get('/userEditAddress', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.userEditAddress);

router.get('/addAddress', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.addAddress);

router.get('/userChangeDefault/:adId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userChangeDefault);

router.get('/deleteAddress/:adId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.deleteAddress);

router.get('/editAddress/:adId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.updateAddress);

router.post('/userupdateAddress', authMiddleware.isUserLoggedIn, userController.userupdateAddress);

router.post('/userAddAddress', authMiddleware.isUserLoggedIn, userController.userAddAddress);

router.get('/userBuyNow/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.userBuyNow);

router.get('/userBuyNowCheckOut/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.userBuyNowCheckOut);

router.post('/userBuyNowCheckOut', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userBuyNowCheckOut);

router.post('/userBuyNowPaymentOrder', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userBuyNowPaymentOrder);

























//////////////////////////Logout////////////////////////////////////////////////////////
router.post('/userLogOut', authMiddleware.isUserBlocked, userController.userLogOut)


// router.get('/userAccount', authMiddleware.isUserBlocked, userController.tempMiddle); // temp logout acc

//api

router.post('/api/userCategory/:category', userController.userProductCategory);

router.post('/api/getproduct/:id', userController.getproduct);

router.post('/api/newlyLauched', userController.newlyLauched);

router.post('/api/getCartItems/:productId/:isUserAuth', userController.getCartItems);

router.post('/api/getCartAllItem/:userId', userController.getCartAllItem);

router.post('/api/userInfo/:userId', userController.userInfo);

router.post('/api/getAddress/:adId', userController.getAddress); 

router.post('/api/changeAddressPayment', userController.changeAddressPayment)

module.exports = router; 