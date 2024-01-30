const express = require('express');
const router = express.Router();

const adminRender = require('../../services/adminSide/adminRender');
const adminController = require('../../controller/adminSide/adminController');
const adminAuthMiddleware = require('../../../middleware/adminSide/authMiddleware/adminAuthMiddleware');
const store = require('../../controller/adminSide/multer');
const adminBannerController = require('../../controller/adminSide/adminBannerController');
const categoryController = require('../../controller/adminSide/categoryController');
const referralOfferController = require('../../controller/adminSide/referralOfferController');
const adminCouponController = require('../../controller/adminSide/adminCouponController');
const adminOfferController = require('../../controller/adminSide/adminOfferController');



// Admin Login Routes
router.route('/adminLogin')
    .get(
        adminAuthMiddleware.noAdminAuth,
        adminRender.adminLogin
    )
    .post(
        adminAuthMiddleware.noAdminAuth,
        adminController.adminLogin
    );

    
    
// Admin Dashboard Route
router.get('/adminHome' , adminAuthMiddleware.isAdminAuth, adminRender.adminHome); // get the page of dashboard

router.post('/downloadSalesReport', adminAuthMiddleware.isAdminAuth, adminController.downloadSalesReport); // Option to download sales report



// Admin Product Management Routes
router.get('/adminProductManagement',adminAuthMiddleware.isAdminAuth, adminRender.adminProductManagement); // Product is listed in Page to manage

router.get('/adminUnlistedProduct', adminAuthMiddleware.isAdminAuth, adminRender.adminUnlistedProduct); // To manage unlisted product

router.route('/adminAddProduct')
    .get(
        adminAuthMiddleware.isAdminAuth,
        adminRender.adminAddProducts
    )
    .post(
        adminAuthMiddleware.isAdminAuth,
        store.array('image', 4),
        adminController.adminAddProduct
    );

router.get('/adminSoftDeleteProduct/:id', adminAuthMiddleware.isAdminAuth, adminController.adminSoftDeleteProduct);// Option to make product unlisted 

router.get('/adminRestoreProduct/:id',adminAuthMiddleware.isAdminAuth, adminController.adminRestoreProduct);// Option to make product listed

router.get('/adminUpdateProduct/:id', adminAuthMiddleware.isAdminAuth, adminRender.adminUpdateProduct); // Update product page

router.get('/adminDeleteProductImg', adminAuthMiddleware.isAdminAuth, adminController.adminDeleteProductImg);// Option to delete img of product without unlink it's soft delete

router.post('/adminUpdateProduct', adminAuthMiddleware.isAdminAuth, store.array('fileInput', 4), adminController.adminUpdateProduct);// Updates the product



// Admin Category Management Routes
router.get('/adminCategoryManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminCategoryManagement); // all listed category can be managed

router.get('/adminUnlistedCategory', adminAuthMiddleware.isAdminAuth, adminRender.adminUnlistedCategory);// all unlisted category can be manage

router.route('/adminAddCategory')
    .get(
        adminAuthMiddleware.isAdminAuth,
        adminRender.adminAddCategory
    )
    .post(
        adminAuthMiddleware.isAdminAuth,
        adminController.adminAddCategory
    );

router.route('/adminUpdateCategory/:categoryId')
    .get(
        adminAuthMiddleware.isAdminAuth,
        adminRender.updateCategory 
    )
    .put(
        adminAuthMiddleware.isAdminAuth,
        categoryController.updateCategory
    );

router.get('/adminSoftDeleteCategory/:id', adminAuthMiddleware.isAdminAuth, adminController.adminSoftDeleteCategory);// Option to make category unlisted

router.get('/adminRestoreCategory/:id', adminAuthMiddleware.isAdminAuth, adminController.adminRestoreCategory);// Option to make category listed



// Admin User Management Routes
router.get('/adminUserManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminUserManagement);// Here all listed users can be managed

router.get('/adminUserStaus/:id/:block', adminAuthMiddleware.isAdminAuth, adminController.adminUserStatus);// Option to block and unblock user

router.get('/adminUserDelete/:id', adminAuthMiddleware.isAdminAuth, adminController.adminUserDelete);// Option to delete users permanently



// Admin Order Management Routes
router.get('/adminOrderManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminOrderManagement); // All order are listed and can be managed

router.post('/adminChangeOrderStatus/:orderId/:productId', adminAuthMiddleware.isAdminAuth, adminController.adminChangeOrderStatus); // Option to change order status



// Admin Banner Management Routes
router.get('/adminBannerManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminBannerManagement);// All listed banner can be managed here

router.get('/adminUnlistedBanner', adminAuthMiddleware.isAdminAuth,  adminRender.adminUnlistedBannerManagement); // All unlisted banner can be managed her

router.route('/adminAddBanner')
        .get(
            adminAuthMiddleware.isAdminAuth,
            adminRender.adminAddBanner
        )
        .post(
            adminAuthMiddleware.isAdminAuth,
            store.fields([{name: 'largeImg', maxCount: 1}, {name: 'smallImg', maxCount: 1}]),
            adminBannerController.adminAddBanner
        );

router.patch('/adminDeleteBanner/:bannerId', adminAuthMiddleware.isAdminAuth,  adminBannerController.adminDeleteBanner);// Option to make banner unlisted

router.patch('/adminRestoreBanner/:bannerId', adminAuthMiddleware.isAdminAuth, adminBannerController.adminRestoreBanner);// Option to make banner listed

router.delete('/adminPremenentDeleteBanner/:bannerId',  adminAuthMiddleware.isAdminAuth, adminBannerController.adminPremenentDeleteBanner);// Option to delete banner permanently



//Admin Referral offer

router.get('/adminReferralOfferManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminReferralOfferManagement);

router.route('/addReferralOffer')
        .get(
            adminAuthMiddleware.isAdminAuth,
            adminAuthMiddleware.onlyOneReferal,
            adminRender.addReferralOffer
            )
        .post(
            adminAuthMiddleware.isAdminAuth,
            adminAuthMiddleware.onlyOneReferal,
            referralOfferController.addReferralOffer
        );

router.route('/adminUpdateReferralOffer/:referralOfferId')
        .get(
            adminAuthMiddleware.isAdminAuth,
            adminRender.updateReferralOffer
        )



//Admin coupon management

router.get('/adminCouponManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminCouponManagement);

router.route('/adminAddCoupon')
        .get(
            adminAuthMiddleware.isAdminAuth,
            adminRender.adminAddCoupon
        )
        .post(
            adminAuthMiddleware.isAdminAuth,
            adminCouponController.adminAddCoupon
        );

router.route('/adminUpdateCoupon/:couponId')
        .get(
            adminAuthMiddleware.isAdminAuth,
            adminRender.adminUpdateCoupon
        )
        .put(
            adminAuthMiddleware.isAdminAuth,
            adminCouponController.adminUpdateCoupon
        );

router.delete('/adminDeleteCoupon/:couponId', adminAuthMiddleware.isAdminAuth, adminCouponController.adminDeleteCoupon);



// Admin Offer Management

router.get('/adminOfferManagement', adminRender.adminOfferManagement) //adminAuthMiddleware.isAdminAuth,

router.route('/adminAddOffer')
        .get(
            // adminAuthMiddleware.isAdminAuth,
            adminRender.adminAddOffer
        )
        .post(
            // adminAuthMiddleware.isAdminAuth,
            adminOfferController.adminAddOffer
        );

router.route('/adminUpdateOffer/:offerId')
        .get(
            // adminAuthMiddleware.isAdminAuth,
            adminRender.adminUpdateOffer
        )
        .put(
            // adminAuthMiddleware.isAdminAuth,
            adminOfferController.adminUpdateOffer
        );

















/////////////////////////////////////LogOut///////////////////////////////////
router.get('/adminLogout', adminAuthMiddleware.isAdminAuth, adminController.adminLogout);





//api
router.post('/api/getDetailsChart', adminAuthMiddleware.isAdminAuth, adminController.getDetailsChart);// Option to get chart details
 


module.exports = router;