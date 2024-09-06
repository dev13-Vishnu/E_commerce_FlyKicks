const express = require("express");
const userRoute = express.Router();
const path = require("path");
const passport = require('passport');
require('../helpers/oAuth');



userRoute.use(passport.initialize());
userRoute.use(passport.session());



const addressContoller = require("../controllers/addressController");
const userController = require("../controllers/userController");
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController');
const wishlistController = require('../controllers/wishlistController');
const couponController = require('../controllers/couponController');
const { isLoggedOut, isLoggedIn } = require("../middlewares/userAuthentication");
const offerController = require('../controllers/offerController');


userRoute.get('/',isLoggedOut,userController.loadLandingPage)
//home page rendering
userRoute.get('/home',isLoggedIn,userController.loadHome);
// load signup page
userRoute.get('/signup',isLoggedOut,userController.loadSignup);
// load login page
userRoute.get('/login',isLoggedOut,userController.loadLogin);
// inserting user
userRoute.post('/signup',userController.insertUser);
// loading otp page
userRoute.get('/otp',isLoggedOut,userController.loadOtp);
// verifying otp
userRoute.post('/otp',isLoggedOut,userController.verifyOtp);

userRoute.post('/resend-otp',userController.resendOTP)

userRoute.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))

userRoute.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect:'/success',
    failureRedirect:'/failure'
}))

userRoute.get('/success',userController.loadSuccessGoogle)

userRoute.get('/failure',userController.loadFailureGoogle);

//verify login
userRoute.post('/login',isLoggedOut,userController.verifyLogin);
userRoute.get('/logout',isLoggedIn,userController.logout)

//search
userRoute.get('/search',isLoggedIn,userController.serchQueries);

//product details
userRoute.get('/product/detail',isLoggedIn,userController.loadProductDetails)
userRoute.get('/account',isLoggedIn,userController.loadAccount);

//add address
userRoute.post('/add-address',isLoggedIn,addressContoller.addAddress);

//edit user profile
userRoute.put('/update-account',isLoggedIn,userController.editAccount)

//edit address
userRoute.get('/account/edit-address',isLoggedIn,userController.loadEditAddress)
userRoute.put('/account/edit-address',isLoggedIn,userController.updateAddress);

//forgot passwrod

userRoute.get('/forgot-password',isLoggedOut,userController.loadForgotPassword);

userRoute.post('/forgot-password',isLoggedOut,userController.forgotPassword);

//reset password
userRoute.get('/reset-password',isLoggedOut,userController.loadResetPassword);
userRoute.post('/reset-password',isLoggedOut,userController.resetPassword);

//add to cart
userRoute.post('/cart/add',isLoggedIn,cartController.addToCart);
userRoute.get('/cart',isLoggedIn,cartController.loadCart);
userRoute.delete('/cart/remove',isLoggedIn,cartController.removeItemsFromCart);
userRoute.get('/cart-checkout',isLoggedIn,orderController.loadCheckout);
userRoute.get('/order-confirmation',isLoggedIn,cartController.loadOrderConfirmation)
userRoute.put('/update-cart',isLoggedIn,cartController.updateQuantity);

//cancel order
userRoute.post('/cancel-order/:orderId',isLoggedIn,orderController.cancelOrder)

//wishlist
userRoute.get('/wishlist',isLoggedIn,wishlistController.loadWishlist)
userRoute.post('/wishlist/add',isLoggedIn,wishlistController.addToWishlist);
userRoute.delete('/wishlist/remove',isLoggedIn,wishlistController.removeFromWishlist);

//order routes
userRoute.post('/place-order-cod',isLoggedIn,orderController.placeOrderCOD);
userRoute.post('/place-order-razorpay',isLoggedIn,orderController.placeOrderRazorPay)
userRoute.post('/api/retry-payment',isLoggedIn,orderController.retryPayment);

userRoute.post('/place-order-wallet',isLoggedIn,orderController.placeOrderWallet);
userRoute.put('/apply-coupon',isLoggedIn,couponController.applyCoupon)
userRoute.post('/remove-coupon',isLoggedIn,couponController.removeCoupon);
userRoute.post('/verify-payment', isLoggedIn,orderController.verifyPayment);
userRoute.get('/payment-failure',isLoggedIn,orderController.payment_failure)
userRoute.get('/order-details',isLoggedIn,orderController.loadUserOrderDetails)
userRoute.post('/cancel-product',isLoggedIn,orderController.cancelIndividualProduct);
userRoute.post('/return-product',isLoggedIn,orderController.returnProduct);
userRoute.post('/track-referral',isLoggedIn,offerController.referANewUser)
userRoute.get('/download-invoice/:orderId',isLoggedIn,orderController.downloadInvoice)

module.exports = userRoute;
 