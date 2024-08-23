const express = require('express');
const adminRoutes = express.Router();

const auth = require('../middlewares/adminAuthentication');
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const ordersListcontroller = require('../controllers/orderListController');
const couponController = require('../controllers/couponController');
const orderController = require('../controllers/orderController');
const offerController = require('../controllers/offerController');

adminRoutes.get('/',auth.isLogout,adminController.login);
adminRoutes.post('/',auth.isLogout,adminController.verifyLogin);
adminRoutes.get('/home',auth.isLogin,adminController.loadDashboard);
adminRoutes.get('/addproduct',auth.isLogin,productController.loadaddProduct);
adminRoutes.get('/logout',auth.isLogin,adminController.logout);

//categories
adminRoutes.get('/categories',auth.isLogin,categoryController.loadCategory);
adminRoutes.post('/categories',auth.isLogin,categoryController.addCategory);
adminRoutes.get('/edit-category',auth.isLogin, categoryController.loadEditCategory);
adminRoutes.post('/edit-category',auth.isLogin,categoryController.editCategory)
adminRoutes.patch('/delete-category',auth.isLogin,categoryController.deleteCategory);
adminRoutes.patch('/add-category',auth.isLogin,categoryController.addBackCategory);


//userslist
adminRoutes.get('/users', auth.isLogin,adminController.loadUserList);
adminRoutes.put('/user-block',auth.isLogin,adminController.userBlock);
adminRoutes.put('/user-unblock',auth.isLogin,adminController.userUnblock);

//productList
adminRoutes.post('/addproduct',auth.isLogin,productController.addProduct);
adminRoutes.get('/products',auth.isLogin,productController.loadProducts);
adminRoutes.get('/products/edit',auth.isLogin,productController.loadEditProduct);
adminRoutes.put('/products/add',auth.isLogin,productController.pushToUserSide)
adminRoutes.delete('/products/delete',auth.isLogin,productController.deleteProduct);
adminRoutes.delete('/products/edit/remove-image',productController.removeImage);
adminRoutes.put('/products/edit',productController.editProduct);

//order
adminRoutes.get('/orders-list',auth.isLogin,ordersListcontroller.loadOrdersList)
adminRoutes.get('/order-details',auth.isLogin,ordersListcontroller.loadOrderDetails)
adminRoutes.post('/cancel-order',auth.isLogin,ordersListcontroller.cancelOrder)
adminRoutes.post('/update-product-status',auth.isLogin,orderController.orderStatus);

//coupons
adminRoutes.get('/coupons',auth.isLogin,couponController.loadCouponsPage)
adminRoutes.get('/addcoupons',auth.isLogin,couponController.loadAddcouponPage);
adminRoutes.post('/addcoupons',auth.isLogin,couponController.addCoupon);
adminRoutes.post('/coupon/block/:id',auth.isLogin,couponController.blockAndUnblockCoupon);
adminRoutes.get('/coupon/edit',auth.isLogin,couponController.loadEditCoupon);
adminRoutes.put('/coupon/edit/:id',auth.isLogin,couponController.editCoupon);

//offers
adminRoutes.get('/offers',auth.isLogin,offerController.loadOfferPage);


module.exports = adminRoutes;