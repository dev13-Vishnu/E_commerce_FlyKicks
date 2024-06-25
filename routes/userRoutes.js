const express = require("express");
const userRoute = express.Router();
const path = require("path");




const userController = require("../controllers/userController");
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




module.exports = userRoute;
 