const express = require('express');
const adminRoutes = express.Router();

const auth = require('../middlewares/adminAuthentication');
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');

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
adminRoutes.get('/delete-category',auth.isLogin,categoryController.deleteCategory);


//userslist
adminRoutes.get('/users', auth.isLogin,adminController.loadUserList);
adminRoutes.get('/user/block',auth.isLogin,adminController.userBlock);
adminRoutes.get('/user/unblock',auth.isLogin,adminController.userUnblock);

module.exports = adminRoutes;