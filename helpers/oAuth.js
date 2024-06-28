const passport = require('passport');

require('dotenv').config();

const User = require('../models/userModel');

const GoogleStrategy = require('passport-google-oauth20')

passport.serializeUser(function(user,done)
{
    done(null,user)
})

passport.deserializeUser(function(user,done){
    if(!user){
        return done(new Error('Usee not found'));
    }
    done(null,user);
});

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:3007/auth/google/callback',
    passReqToCallback:true
},
async function(request, accessToken, refreshToken, profile, done){
    try {
        let user = await User.findOne({googleId:profile.id}).exec()

        if(!user){
            user = await User.create({
                googleId:profile.id,
                email:profile.emails[0].value,
                username:profile.displayName,
                isBlocked: false,
                password:"",
                mobile:""
            });
        }
        return done(null,user);
        
    } catch (error) {
        return done(error);
    }
}));