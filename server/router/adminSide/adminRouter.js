const express = require('express');
const router = express.Router();

const adminRender = require('../../services/adminSide/adminRender');
const adminController = require('../../controller/adminSide/adminController');
const adminAuthMiddleware = require('../../../middleware/adminSide/authMiddleware/adminAuthMiddleware');
const store = require('../../controller/adminSide/multer');

router.get('/adminLogin', adminAuthMiddleware.noAdminAuth, adminRender.adminLogin);

router.post('/adminLogin', adminController.adminLogin);

router.get('/adminHome', adminAuthMiddleware.isAdminAuth, adminRender.adminHome); 

router.get('/adminAddProduct', adminAuthMiddleware.isAdminAuth, adminRender.adminAddProducts);

router.post('/adminAddProduct', adminAuthMiddleware.isAdminAuth, store.array('image', 4), adminController.adminAddProduct);

router.get('/adminProductManagement',adminAuthMiddleware.isAdminAuth, adminRender.adminProductManagement);

router.get('/adminUnlistedProduct', adminAuthMiddleware.isAdminAuth, adminRender.adminUnlistedProduct);

router.get('/adminCategoryManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminCategoryManagement);

router.get('/adminAddCategory', adminAuthMiddleware.isAdminAuth, adminRender.adminAddCategory);

router.post('/adminAddCategory', adminAuthMiddleware.isAdminAuth, adminController.adminAddCategory);

router.get('/adminUnlistedCategory', adminAuthMiddleware.isAdminAuth, adminRender.adminUnlistedCategory);

router.get('/adminSoftDeleteCategory/:id', adminAuthMiddleware.isAdminAuth, adminController.adminSoftDeleteCategory);

router.get('/adminRestoreCategory/:id', adminAuthMiddleware.isAdminAuth, adminController.adminRestoreCategory);

router.get('/adminSoftDeleteProduct/:id', adminAuthMiddleware.isAdminAuth, adminController.adminSoftDeleteProduct);

router.get('/adminRestoreProduct/:id',adminAuthMiddleware.isAdminAuth, adminController.adminRestoreProduct);

router.get('/adminUpdateProduct/:id', adminAuthMiddleware.isAdminAuth, adminRender.adminUpdateProduct);

router.get('/adminDeleteProductImg', adminAuthMiddleware.isAdminAuth, adminController.adminDeleteProductImg);

router.post('/adminUpdateProduct', adminAuthMiddleware.isAdminAuth, store.array('fileInput', 4), adminController.adminUpdateProduct);

router.get('/adminUserManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminUserManagement);

router.get('/adminUserStaus/:id/:block', adminAuthMiddleware.isAdminAuth, adminController.adminUserStatus);

router.get('/adminUserDelete/:id', adminAuthMiddleware.isAdminAuth, adminController.adminUserDelete);

router.get('/adminOrderManagement', adminAuthMiddleware.isAdminAuth, adminRender.adminOrderManagement); 

router.post('/adminChangeOrderStatus/:orderId', adminAuthMiddleware.isAdminAuth, adminController.adminChangeOrderStatus); 



























/////////////////////////////////////LogOut///////////////////////////////////
router.get('/adminLogout', adminAuthMiddleware.isAdminAuth, adminController.adminLogout);





//api
router.get('/api/userCount', adminController.countUser);

router.get('/api/getProductList/:value', adminController.showProduct);

router.post('/api/getCategory/:value', adminController.getCategory);

router.get('/api/getProduct/:id', adminController.getProduct);

router.post('/api/getAllUser', adminController.getAllUser);

router.post('/api/getAllcartItemsWithFilter', adminController.getAllcartItemsWithFilter);



module.exports = router;