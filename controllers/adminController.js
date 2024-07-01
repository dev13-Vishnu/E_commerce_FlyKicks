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
        console.log(req.body.email,'\n',req.body.password );

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
                res.render('admin/login',{messaga: "email and password doesna't match"});
            }
        }
    } catch (error) {
        console.log('Error in adming verify login',error);
    }
};

const loadDashboard = async(req,res)=>{
    try {
        res.render('admin/dashboard');
        console.log('dashboard rederning');

    } catch (error) {
    console.log('admin controll loadDashboard error',error);        
    }
}


module.exports={
    login,
    verifyLogin,
    loadDashboard
}