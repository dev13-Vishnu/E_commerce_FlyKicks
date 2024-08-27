const nodemailer = require('nodemailer');
require('dotenv').config();

const sendReferralMail = (referrerName, referralEmail, referralLink) => {
    return new Promise((resolve, reject) => {
        console.log('Sending referral email to:', referralEmail);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Email,
                pass: process.env.Password
            }
        });

        const mailOptions = {
            from: process.env.Email,
            to: referralEmail,
            subject: 'You’ve been referred!',
            html: `<p>Hi! ${referrerName} has referred you to join our website. Click the link below to sign up and receive a special gift:</p>
                   <p><a href="${referralLink}">${referralLink}</a></p>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error from helper > sendReferralMail:', err.message);
                reject(err);
            } else {
                console.log('Referral Email sent:', info.response);
                resolve(info);
            }
        });
    });
};

module.exports = {
    sendReferralMail
};
