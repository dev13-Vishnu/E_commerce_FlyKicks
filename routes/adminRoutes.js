const express = require('express');
const adminRoutes = express.Router();

const auth = require('../middlewares/adminAuthentication');
const adminController = require('../controllers/adminController');


adminRoutes.get('/',auth.isLogout,adminController.login);
adminRoutes.post('/',auth.isLogout,adminController.verifyLogin);
adminRoutes.get('/home',auth.isLogin,adminController.loadDashboard);

module.exports = adminRoutes;