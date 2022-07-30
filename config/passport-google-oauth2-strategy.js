const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');
const randtoken = require('rand-token');
// tell passport to use a new strategy for google login
passport.use(new googleStrategy({
        clientID: process.env.google_client_id,
        clientSecret: process.env.google_client_secret,
        callbackURL: process.env.google_call_back_url,
    },

    function(accessToken, refreshToken, profile, done){
        // find a user
        User.findOne({email: profile.emails[0].value}).exec(function(err, user){
            if (err){console.log('error in google strategy-passport', err); return;}
            

            if (user){
                // if found, set this user as req.user
                return done(null, user);
            }else{
                // if not found, create the user and set it as req.user
                
                User.create({
                    email: profile.emails[0].value,
                    password: randtoken.generate(16),
                    token:randtoken.generate(16),
                }, function(err, user){
                    if (err){console.log('error in creating user google strategy-passport', err); return;}

                    return done(null, user);
                });
            }

        }); 
    }


));


module.exports = passport;
