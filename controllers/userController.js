const User = require("../models/userModel");
const otp = require("../helpers/otp");
const securePassword = require("../helpers/securePassword");
const bcrypt = require('bcrypt');
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Address = require("../models/addressModel");
const randomstring = require('randomstring');
const forgetPassword = require('../helpers/forgotPassword');
const Order = require('../models/orderModel');


const loadSuccessGoogle = async (req, res) => {
  try {
    if (!req.user) {
      console.log("not in user load success");
      res.redirect("/failure");
      console.log(req.user);
    } else {
      console.log("loadsuccess", req.user._id);
      req.session.user = {
        _id: req.user._id,
        username: req.user.username,
      };
      console.log("success", req.user._id);
      res.status(200).redirect("/home");
    }
  } catch (error) {
    console.log("error from the user controller load success", error);
  }
};

const loadSignup = async (req, res) => {
  try {
    res.render("user/signup");
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};

const loadFailureGoogle = async (req, res) => {
  try {
    console.log("failed");
    res.status(404).redirect("/login");
  } catch (error) {
    console.log("error from UserController loadFailureGoogle", error);
  }
};

const loadLandingPage = async (req, res) => {
  try {
    //render home page

        //pagination
        var page = 1;
        if(req.query.page){
          page = req.query.page;
        }

        const limit = 6;


        const products = await Product.find({delete:false})
        .limit(limit * 1)
        .skip((page -1) * limit)
        .exec();

        const count = await Product.find({delete:false})
        .countDocuments();

        products.forEach(product => {
            product.image = product.image.map(img => img.replace(/\\/g, '/'));
        });
        console.log('products url', req.url)
      res.render('user/land',{products,
        totalPages:Math.ceil(count/limit),
        currentPage: page,
      currentUrl:req.query.page
    });
  } catch (error) {
    console.log("errro from userController londhome", error);
  }
};

const insertUser = async (req, res) => {
  try {
    const existingEmail = await User.findOne({
      email: req.body.email,
    });
    const existingMobile = await User.findOne({
      email: req.body.mobile,
    });
 
    if (existingMobile && existingEmail) {
      res.render("user/signup", {
        message: "Email and Phone number already exist!",
      });
      console.log("Email and number already exist");
    } else if (existingEmail) {
      res.render("user/signup", {
        message: "Email already exist!",
      });
      console.log("Email already exist!");
    } else if (existingMobile) {
      res.render("user/signup", {
        message: "Phone number already exist!",
      });
      console.log("Mobile number already exist!");
    } else {
      // creating OTP

      const otpCode = otp.generate();
      console.log("otp geenrator" + otpCode);
      // for saving otp data's in session for verifying in future
      req.session.tempUser = req.body;
      

      req.session.email = req.body.email;
      req.session.otp = otpCode;
      req.session.otpExpire = Date.now() + 60 * 1000;

      console.log("OTP:" + req.session.otp);

      await otp
        .sendOtp(req.session.email, otpCode)
        .then((result) => {
          res.redirect("/otp");
          console.log(result);
        })
        .catch((err) => {
          res.render("user/signup", {
            message: "error in otp or server error please try again",
          });
          console.log(err);
        });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtp = async (req, res) => {
  try {
    res.render("user/otp");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    // const obj = req.body;
    // console.log('obj verifyOtp:',obj);

    // const jsonString = JSON.stringify(obj);

    // console.log("jsonstring" + jsonString);

    const data = req.body['otp-1']+req.body['otp-2']+req.body['otp-3']+req.body['otp-4'];
    // console.log('concatenated otp:',data);
    // console.log('typof data,verifyOtp:',typeof data);


    if (data && typeof data === "string") {
      const otp = data.trim();
      console.log(otp);
      const enterOtp = otp;

      const sessionOtp = req.session.otp;
      const expOtp = req.session.otpExpire;
      console.log("entered otp" + enterOtp);
      console.log("session otp" + sessionOtp);
      console.log("expire in session" + expOtp);

      if (enterOtp === sessionOtp && Date.now() < expOtp) {
        console.log("otp verification finished");
        req.session.otp = null;
        const userData = req.session.tempUser;
        // console.log(userData.password, userData);
        const Spassword = await securePassword.SecurePassword(
          userData.password
        );

        const user = await User.create({
          username: userData.username,
          email: userData.email,
          mobile: userData.mobile,
          password: Spassword,
          isBlocked: false,
        });
        const userInfo = await user.save();
        if (userInfo) {
          req.session.user = userInfo;
          req.session.tempUser = null;
          res.redirect("/home");
          console.log("saved user in mongo db");
        }
      }else {

      console.log('incorrect otp');
      res.render("user/otp", {
        message: "Incorrect or expired  OTP. Please try again",
      });
    }
    } 
  } catch (error) {
    console.log("error from user control > verifyOtp", error);
  }
};

//resend OTP
const resendOTP = async (req, res) => {
  try {
    console.log("resend otp rendering");
    if (req.session.otp || req.session.otpExpire < Date.now()) {
      // generate now otp
      const otpCode = otp.generate();
      console.log("resendotp", otpCode);
      req.session.otp = otpCode;
      req.session.otpExpire = Date.now() + 60 * 1000;

      await otp.sendOtp(req.session.email, otpCode).then((result) => {
        res.redirect("/otp");
        console.log('resendOtp usercontroller result:',result);
      });
    }
  } catch (error) {
    console.log("error from userController resend otp", error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.isBlocked) {
        res.render("user/login", { message: "user is blocked" });
      } else {
        console.log(userData.email);
        console.log("verify login");

        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          req.session.user = {
            _id: userData._id,
            email: email,
            isBlocked: false,
            username: userData.username,
          };
          res.redirect("/home");
        } else {
          res.render("user/login", { message: "Wrong password" });
        }
      }
    } else {
        res.render('user/login',{message:'Your Email and password is wrong'})
    }
  } catch (error) {
    console.log('error from userController verify login',error);
  }
};

const loadHome = async(req,res)=>{
    try {
        let name ="";
        if(req.session.user){
            name = req.session.user.username;

            // console.log("username:",name);
        }
        const userId = req.session.user._id;
        const userData = await User.findById(userId);
        // console.log("username:",name);

        // console.log('load home:',req.session.user);

        //render home page


        //pagination
        var page = 1;
        if(req.query.page){
          page = req.query.page;
        }

        const limit = 6;


        const products = await Product.find({delete:false})
        .limit(limit * 1)
        .skip((page -1) * limit)
        .exec();

        const count = await Product.find({delete:false})
        .countDocuments();

        products.forEach(product => {
            product.image = product.image.map(img => img.replace(/\\/g, '/'));
        });
        console.log('products url', req.url)
      res.render('user/home',{products,
        totalPages:Math.ceil(count/limit),
        currentPage: page,
      currentUrl:req.query.page,
        userData
      
    });
        
    } catch (error) {
        console.log("error from userController.loadHome",error);
    }
}


const logout = async(req,res)=> {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("error from admin logout", err);
        res.status(500).send("server error");
      } else {
        console.log("logout working");
        res.redirect("/login");
      }
    });
    
  } catch (error) {
    console.log('error from userController.logout',error);
  }
}

const loadProductDetails = async (req,res) =>{
  try {
    console.log('passed id:',req.query.id);

    const userId = req.session.user._id;
        const userData = await User.findById(userId);
    const id = req.query.id;
    
    const product = await Product.findById(id);
    if(!product){
      return res.status(404).send('product not found');
    }

    //product image 
    product.image = product.image.map(img => img.replace(/\\/g,'/'));
  

    const category =  await Category.findById(product.category);
    const categoryName = category.name;

    console.log('category:',categoryName);

    const relatedProducts = await Product.find({
      category: category._id,
      _id: {$ne: product._id},
      delete:false
    }).limit(4);

    relatedProducts.forEach(prod =>{
      prod.image = prod.image.map(img => img.replace(/\\/g, '/'));
    });

    console.log('stock:',product.stock);
    console.log('product data:',product)
    res.render('user/productDetails',{product,
      userData,
      stock: product.stock,
      relatedProducts,
      breadcrumbs: [
          { name: 'Home', url: '/home' },
          { name: categoryName, url: `/category/${product.category}` },
          { name: product.name, url: `/product/${id}` }
      ]});
  } catch (error) {
    console.log('error from userController.loadProductDetails',error);

  }
}

//load account
const loadAccount = async(req,res)=>{
  try {
    // const sessionUserData = req.session.user;
    const userId = req.session.user._id;
    const userData = await User.findById(userId);
    const addressData = await Address.find({userId});
    const orderData = await Order.find({userId});



    // console.log('userController. loadAccount,addressData:',addressData);
    

    

    // console.log('loadAccount userId:',userId);
    // console.log('loadAccount userData:',userData);
    // console.log('load account user:',req.session.user);
    res.render('user/userAccount',{
      userData,
      addressData,
      userData,
      orderData
    }
    )
  } catch (error) {
    console.log('error from userController.loadAccount',error);
  }
}

//edit account
const editAccount = async(req,res) =>{
    const {username, mobile, email,  currentPassword, newPassword, confirmPassword} = req.body;

  try {

    //find user by email
    const user = await User.findOne({email});

    if(!user){
      return res.status(404).json({success: false, message: 'user not found'});
    }

    //check if the current passwrod matches
    const isMatch = await bcrypt.compare(currentPassword,user.password);
    if(!isMatch){
      return res.status(400).json({success: false, message: 'Incorrect current passwrod'});
    }
    
    // update user details
    user.username = username;
    user.mobile = mobile;

    if(newPassword && confirmPassword) {
      if(newPassword !== confirmPassword){
        return res.status(400).json({success: false, message: 'Passwords do not match'});
      }
      user.password = await bcrypt.hash(newPassword,10);
    }

    await user.save();

    res.status(200).json({success: true, message: 'Profile updated successfully'});


  } catch (error) {
    res.status(500).json({success: false, message: 'internal server error'});
  }
};

//load edit address page

const loadEditAddress = async(req,res) =>{
  try {
    const userId = req.session.user._id;
    const userData = await User.findById(userId);

    const addressId = req.query.addressId;
    console.log('addressId userControl loadEditAddress:',addressId);

    const addressDoc = await Address.findOne({userId});

    if(addressDoc){
      const addressDetails = addressDoc.address.find(addr => addr._id.toString() === addressId);
      // console.log('addressDetails userControl loadEditAddress:',addressDetails);
    res.render('user/editAddress',{
      userData,
      addressDetails
    });
    }
    




  } catch (error) {
    console.log('error from userContorller loadEditAddress:',error)
  }
}

//update address

const updateAddress = async(req,res) =>{
  try {
    const userId = req.session.user._id;
    const {addressId, name, country, state, city, mobile, street, pincode} = req.body;

    //find the address document for the User
    const addressDoc = await Address.findOne({userId});

    // console.log('userController.updateAddress, addrsssDoc:',addressDoc);

    
    if (addressDoc) {
      
      const address = addressDoc.address.id(addressId);
      if(address){
        address.name = name;
        address.mobile = mobile;
        address.country = country;
        address.state = state;
        address.city = city;
        address.street = street;
        address.pincode = pincode;

      
        await addressDoc.save();

        res.status(200).json({message:'Address updated successfully'});
      } else {
        res.status(404).json({message:'Address not found'});
      }
    } else {
      res.status(404).json({message:'User addrss document not found'});
    }
  } catch (error) {
    console.log('erro from userController.updateAddress:',error);
    res.status(500).json({message:'Internal server Error'});
  }
};

//load forgot password
const loadForgotPassword = async(req,res)=>{
  try {
    res.render('user/forgotPassword')
  } catch (error) {
    console.log('Error form userController.loadForgotPassword :',error)
  }
}

const forgotPassword = async (req,res) =>{
  try {
    const email = req.body.email;
    console.log('userControll.forgotPassword email:',email);
    const userData = await User.findOne({email:email});


    if(userData){

    const randomString = randomstring.generate();

    //setting token in user document in data base

    const data = await User.updateOne({email:email},{$set:{token:randomString}});
    
    if (data) {
      forgetPassword.sendResetPasswordMail(userData.username,userData.email,randomString)
      res.render('user/forgotPassword',{sMessage:'check your mail inbox and reset your password'});
    } 

    }else {
      res.render('user/forgotPassword',{fMessage:' Your email is not valid'});
    }
  } catch (error) {
    console.log('error from usercontroll forgotpassword',error);
  }
}

const loadResetPassword = async(req,res) =>{
  try {
    res.render('user/resetPassword');
  } catch (error) {
    console.log('error from user controel reset passwrod :',error);
  }
}

const resetPassword = async(req,res) =>{
  try {
    const token = req.query.token;
    // console.log('userController reset password token:',token);
    const tokenData = await User.findOne({token:token})

    if(tokenData) {
    const password = req.body.newPassword;
    // console.log('userController.resetPassword req.body.password:',password);

    const Spassword = await securePassword.SecurePassword(password);

    const userData = await User.findByIdAndUpdate(
      {_id:tokenData._id},
      {$set:{password:Spassword,token:""}},
      {new:true}
    )
    res.redirect('/login');

    console.log('userController.resetPassword userData.Password:',userData.password);
    console.log('userControllr.resetPassword tokenData.password:',tokenData.password);

    }

  } catch (error) {
    console.log('error from userController.resetPassword:',error);
  }
}

module.exports = {
  loadSignup,
  loadLogin,
  loadOtp,
  insertUser,
  verifyOtp,
  resendOTP,
  loadSuccessGoogle,
  loadFailureGoogle,
  loadLandingPage,
  verifyLogin,
  loadHome,
  logout,
  loadProductDetails,
  loadAccount,
  editAccount,
  loadEditAddress,
  updateAddress,
  loadForgotPassword,
  forgotPassword,
  loadResetPassword,
  resetPassword


};
