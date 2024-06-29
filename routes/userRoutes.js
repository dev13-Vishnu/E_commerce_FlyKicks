const express = require("express");
const userRoute = express.Router();
const path = require("path");
const passport = require('passport');
require('../helpers/oAuth');

const nocache = require('nocache');

const setNoCacheHeaders = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

userRoute.use(passport.initialize());
userRoute.use(passport.session());


const userController = require("../controllers/userController");
const { isLoggedOut, isLoggedIn } = require("../middlewares/userAuthentication");


userRoute.get('/',setNoCacheHeaders,userController.loadLandingPage)
//home page rendering
userRoute.get('/home',isLoggedIn,setNoCacheHeaders,userController.loadHome);
// load signup page
userRoute.get('/signup',userController.loadSignup);
// load login page
userRoute.get('/login',isLoggedOut,setNoCacheHeaders,userController.loadLogin);
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

module.exports = userRoute;
 