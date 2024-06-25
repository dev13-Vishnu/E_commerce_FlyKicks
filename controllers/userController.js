const User = require("../models/userModel")
const otp = require('../helpers/otp');
const securePassword = require('../helpers/securePassword')

const loadLoginSignup = async(req,res)=>{
    try {
        res.render('user/signup')
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req,res)=>{
    try {
        res.render('user/login');   
    } catch (error) {
        console.log(error.message);
    }
}




const insertUser = async(req,res) => {
    try {
        const existingEmail = await User.findOne({
            email:req.body.email
        })
        const existingMobile = await User.findOne({
            email: req.body.mobile
        })

        if(existingMobile && existingEmail){
            res.render('user/signup',{
                message:'Email and Phone number already exist!'
            })
            console.log("Email and number already exist");
        }else if (existingEmail){
            res.render('user/signup',{
                message: 'Email already exist!'
            })
            console.log("Email already exist!");
        }else if(existingMobile) {
            res.render('user/signup',{
                message:'Phone number already exist!'
            })
            console.log("Mobile number already exist!")
        }else{

            // creating OTP

            const otpCode = otp.generate()
            console.log('otp geenrator'+otpCode);
            // for saving otp data's in session for verifying in future
            req.session.tempUser = req.body;
            req.session.email = req.body.email;
            req.session.otp = otpCode;
            req.session.otpExpire = Date.now() + 60 * 1000;

            console.log('OTP:' + req.session.otp);


            await otp.sendOtp(req.session.email,otpCode)
            .then((result) => {
                res.redirect('/otp');
                console.log(result);
            }).catch((err) => {
                res.render('user/signup',{
                    message:'error in otp or server error please try again'
                })
                console.log(err);
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadOtp = async (req,res) =>{
    try {
        res.render('user/otp')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async(req,res) =>{
    try {
        const obj = req.body;

        const jsonString = JSON.stringify(obj)

        console.log("jsonstring"+ jsonString);
        
        const data = req.body;

        if (data.verify && typeof data.verify === 'string') {
            const otp = data.verify;
            console.log(otp);
            const enterOtp = otp;

            const sessionOtp = req.session.otp
            const expOtp = req.session.otpExpire
            console.log('entered otp'+enterOtp);
            console.log('session otp'+sessionOtp);
            console.log('expire in session'+expOtp);

            if(enterOtp === sessionOtp && Date.now() < expOtp){
                console.log('otp verification finished');
                req.session.otp = null;
                const userData = req.session.tempUser;
                // console.log(userData.password, userData);
                const Spassword = await securePassword.SecurePassword(userData.password);

                const user = await User.create({
                    username: userData.username,
                    email: userData.email,
                    mobile: userData.mobile,
                    password:Spassword,
                    isBlocked: false
                })
                const userInfo = await user.save();
                if (userInfo) {
                    res.redirect('/login');
                    console.log('saved user in mongo db');

                }
            }
        } else {
            res.render('user/otp',{message:'Incorrect OTP or expired  OTP. Please try again'})
        }

    } catch (error) {
        console.log('error from user control > verifyOtp',error);
    }
}

//resend OTP
const resendOTP = async(req,res) =>{
    try {
        console.log('resend otp rendering');
        if(req.session.otp || req.session.otpExpire < Date.now()){
            // generate now otp
            const otpCode = otp.generate();
            console.log("resendotp",otpCode)
            req.session.otp = otpCode
            req.session.otpExpire = Date.now() + 60 * 1000

            await otp.sendOtp(req.session.email, otpCode)
            .then((result) =>{
                res.redirect('/otp');
                console.log(result);
            })
        }
    } catch (error) {
        console.log('error from userController resend otp',error);
    }
}

module.exports= {
    loadLoginSignup,
    loadLogin,
    loadOtp,
    insertUser,
    verifyOtp,
    resendOTP
}