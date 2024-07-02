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

//categories
adminRoutes.get('/categories',auth.isLogin,categoryController.loadCategory);
adminRoutes.post('/categories',auth.isLogin,categoryController.addCategory);



module.exports = adminRoutes;