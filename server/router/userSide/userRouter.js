const express = require('express');

const router = express.Router();

const userRender = require('../../services/userSide/userRender');
const userController = require('../../controller/userSide/userController');
const authMiddleware = require('../../../middleware/userSide/authMiddleware/authMiddleware');
const wishlistController = require('../../controller/userSide/wishlistController');



// User Login Routes
router.route('/userLogin')
    .get(
        authMiddleware.isUserAuth, 
        authMiddleware.noUserLoginResetPassword, 
        userRender.userLogin
    )
    .post(
        authMiddleware.isUserAuth, 
        userController.userLogin
    );



// User Register Routes
router.route('/userRegister')
    .get(
        authMiddleware.noOtpVerify,
        authMiddleware.isUserAuth,
        userRender.userRegister
    )
    .post(
        authMiddleware.noOtpVerify,
        authMiddleware.isUserAuth,
        userController.userRegister
    );

router.route('/userRegisterOtpVerify')
    .get(
        authMiddleware.otpVerify,
        authMiddleware.isUserAuth,
        userRender.userRegisterOtpVerify
    )
    .post(
        authMiddleware.otpVerify,
        authMiddleware.isUserAuth,
        userController.userRegisterOtpVerify
    );

router.get('/userRegisterEmailVerifyResend', authMiddleware.otpVerify, authMiddleware.isUserAuth, userController.userRegisterEmailVerifyResend); // Resend otp in user register



// User Forgot Password Routes
router.get('/userForgotPassword', authMiddleware.isUserAuth,authMiddleware.noUserLoginResetPassword, userRender.userForgotPassword); // frogot pass get

router.post('/userLoginEmailVerify', userController.userLoginEmailVerify); // checking if given email is already a user

router.post('/userLoginOtpVerify', userController.userLoginOtpVerify); // otp verify in forgot password page

router.get('/userLoginEmailVerifyResend',  userController.userLoginEmailVerifyResend); // resend otp in forgot password page



// User Rest Password Routes
router.route('/userLoginResetPassword')
    .get(
        authMiddleware.userLoginResetPassword,
        userRender.userResetPassword
    )
    .post(
        authMiddleware.userLoginResetPassword,
        userController.userLoginResetPass
    );



// User Home Routes
router.get('/', authMiddleware.isUserBlocked, authMiddleware.noUserLoginResetPassword, userRender.homePage);



// User product listing
router.get('/Category/:category', authMiddleware.isUserBlocked, userRender.showProductsCategory); // To list all product in given category for user

router.get('/userProductDetail/:id', authMiddleware.isUserBlocked, userRender.userProductDetails);// Detail page for chosen product



// User Cart Routes (add product, remove products from cart and inc or dec qty of products in cart)
router.get('/usersAddToCart', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.usersAddToCart); // page to list all existing products in cart

router.get('/userCartNow/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userCartNow);// Option to add new product to cart

router.get('/userCartDelete/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userCartDelete);// Option to delete product from cart

router.get('/userCartItemUpdate/:productId/:values', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userCartItemUpdate);// Option to inc or dec qty of selected product in cart



// User Account Routes (view profile and Update)
router.get('/userAccount', authMiddleware.isUserLoggedIn,authMiddleware.isUserBlocked, userRender.userProfile);

router.route('/userUpdateAccount')
    .get(
        authMiddleware.isUserLoggedIn,
        authMiddleware.isUserBlocked,
        userRender.userUpdateAccount
    )
    .post(
        authMiddleware.isUserLoggedIn,
        authMiddleware.isUserBlocked,
        userController.userUpdateAccount
    );

router.get('/userWallet', authMiddleware.isUserLoggedIn,authMiddleware.isUserBlocked, userRender.userWallet)



// User Address Router (view address, change default, add, delete and update address)
router.get('/userEditAddress', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.userEditAddress); // list all existing address page

router.get('/addAddress', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.addAddress); // add new addres for user page

router.get('/userChangeDefault/:adId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userChangeDefault);// change default addres of the user 

router.get('/deleteAddress/:adId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.deleteAddress);// delete address of user

router.get('/editAddress/:adId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.updateAddress);// Update address of user page

router.post('/userupdateAddress', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userupdateAddress); // Updates the new address 

router.post('/userAddAddress', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userAddAddress);// adds new address



// User buynow Routes (payment from cart and single product page)
router.get('/userBuyNow/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.userBuyNow); // Buynow page for single product page

router.route('/userBuyNowCheckOut')
    .get(
        authMiddleware.isUserLoggedIn,
        authMiddleware.isUserBlocked,
        userRender.userBuyNowCheckOut 
    )
    .post(
        authMiddleware.isUserLoggedIn,
        authMiddleware.isUserBlocked,
        userController.userBuyNowCheckOut
    );

router.post('/userCartCheckOut', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userCartCheckOut); // check out form cart

router.post('/userBuyNowPaymentOrder', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userBuyNowPaymentOrder); // payment options to place order

router.get('/userOrderSuccessfull', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, authMiddleware.isAuthOrder,userRender.userOrderSuccessfull); // order successful page when a order is placed

router.post('/onlinePaymentSuccessfull', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.onlinePaymentSuccessfull); // online payment callback url for razor pay



// User Order Routes (view orders, cancel orders, invoice download and order summary)
router.get('/userOrders', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userRender.userOrders);// User order history listing page

router.get('/userOrderCancel/:orderId/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userOrderCancel);// Option to cancel order of user

router.get('/userOrderDownloadInvoice/:productId/:orderId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userOrderDownloadInvoice); // Download invoice of delivered orders



// User wishlist Routes
router.patch('/userAddToWishlist/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, wishlistController.addToWishlist);// Option to add a product to user wishlist

router.patch('/userDeleteWishlist/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, wishlistController.deleteFromWishlist);// Option to remove product form whislist



// User Rate and Review Routes
router.get('/userProductRate/:productId', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, authMiddleware.isDelivered,  userRender.userProductRate); // Rate product page
























//////////////////////////Logout//////////////////////////////////////////////////////////////////////////////////
router.post('/userLogOut', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.userLogOut);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////









///////////////////////////////////////////////api////////////////////////////////////////
router.post('/api/changeAddressPayment', authMiddleware.isUserLoggedIn, authMiddleware.isUserBlocked, userController.changeAddressPayment); // Option to change address from check out page

module.exports = router; 