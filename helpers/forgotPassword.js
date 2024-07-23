const nodemailer = require ('nodemailer');
require('dotenv').config()

const sendResetPasswordMail = (username,email,token)=>{
    return new Promise((resolve,reject)=>{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user: process.env.Email,
                pass: process.env.Password
            }
        })
         const mailOption ={
            from:process.env.Email,
            to:email,
            subject:'reset password',
            html: '<p> Hai '+username+' Please Click the link <a href ="http://localhost:3007/reset-password?token='+token+'">and reset your password</a></p>'
         }
         transporter.sendMail(mailOption,(err,info)=>{
            if (err) {
                console.log('error from helper > forgot > sendmail',err.message);
                reject(err);
            } else {
                console.log('Email sent:'* info.response);
                resolve(info);
            }
         })
    })
}

module.exports = {
    sendResetPasswordMail
}