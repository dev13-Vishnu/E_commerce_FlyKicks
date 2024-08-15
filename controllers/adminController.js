const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const seccurePassword = require('../helpers/securePassword');



const login = async(req,res)=>{
    try {
        res.render('admin/login');
    } catch (error) {
        console.log('error from adimincontroller login',error);
    }
};

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        // console.log(req.body.email,'\n',req.body.password );

        const userData = await User.findOne({email: email});
        {
            if (userData) {
                // console.log("userdata und");
                // console.log(userData.password)
                const passwordMatch = await bcrypt.compare(password,userData.password);
                if(passwordMatch){
                    if(userData.isAdmin===1){
                        req.session.admin = {
                            _id:userData._id,
                            email:email,
                        };
                    res.redirect('/admin/home')
                    console.log('rendering working');

                    }else{
                        res.render('admin/login',{message:'you are not a Admin'});

                    }
                }else{
                    res.render('admin/login',{message:'passwod does not match'});

                }
            }else{
                res.render('admin/login',{message: "email and password doesn't match"});
            }
        }
    } catch (error) {
        console.log('Error in adming verify login',error);
    }
};

const loadDashboard = async(req,res)=>{
    try {
        console.log(req.url);
        res.render('admin/dashboard',{currentUrl:req.url});
        console.log('dashboard rederning');

    } catch (error) {
    console.log('admin controll loadDashboard error',error);        
    }
}

const loadUserList = async(req,res)=>{
    try {
        
         var page = 1;
         if(req.query.page){
            page = req.query.page;
         }

         const limit = 5;
         
    

        const users = await User.find({isAdmin : 0})
        .limit(limit*1)
        .skip((page - 1) * limit)
        .exec();

        const count = await User.find({isAdmin:0})
        .countDocuments();



        // console.log(users);
        
        res.render('admin/userslist',{users,
            totalPages:Math.ceil(count/limit),
            currentPage: page,
            currentUrlPage:req.query.page,
            currentUrl:req.url});
    } catch (error) {
        console.log( "error from admin contronller LoadUsersList",error);
    }
}

const userBlock = async (req, res) => {
    try {
        const saved = await User.findByIdAndUpdate(
            { _id: req.query.id },
            { $set: { isBlocked: true } },
            { new: true }
        );
        if (saved) {
            res.sendStatus(200); // Success
        }
    } catch (error) {
        console.log('error from admincontroller userBlock', error);
        res.sendStatus(500); // Failure
    }
};

const userUnblock = async (req, res) => {
    try {
        const saved = await User.findByIdAndUpdate(
            { _id: req.query.id },
            { $set: { isBlocked: false } },
            { new: true }
        );
        if (saved) {
            res.sendStatus(200); // Success
        }
    } catch (error) {
        console.log('error from admincontroller userUnblock', error);
        res.sendStatus(500); // Failure
    }
};


const logout = async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.log("error from admin logout", err);
          res.status(500).send("server error");
        } else {
          console.log("logout working");
          res.redirect("/admin");
        }
      });
    } catch (error) {
      console.log("error from admin controll logout", error);
    }
  };

  


module.exports={
    login,
    verifyLogin,
    loadDashboard,
    loadUserList,
    userBlock,
    userUnblock,
    logout
}