const express = require("express");
const userRoute = express.Router();
const path = require("path");
const passport = require('passport');
require('../helpers/oAuth');

const nocache = require('nocache');

userRoute.use(passport.initialize());
userRoute.use(passport.session());


const userController = require("../controllers/userController");


userRoute.get('/',userController.loadLandingPage)
// load signup page
userRoute.get('/signup',userController.loadLoginSignup);
// load login page
userRoute.get('/login',userController.loadLogin);
// inserting user
userRoute.post('/signup',userController.insertUser);
// loading otp page
userRoute.get('/otp',userController.loadOtp);
// verifying otp
userRoute.post('/otp',userController.verifyOtp);

userRoute.post('/resend-otp',userController.resendOTP)

userRoute.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))

userRoute.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect:'/success',
    failureRedirect:'/failure'
}))

userRoute.get('/success',userController.loadSuccessGoogle)

userRoute.get('/failure',userController.loadFailureGoogle);

module.exports = userRoute;
 