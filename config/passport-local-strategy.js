const passport = require('passport');
const axios=require('axios');
const bcrypt=require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

// authentication using passport
passport.use(new LocalStrategy({
        usernameField:'email',
        passwordField:'psw',
        passReqToCallback: true
        
    },
   async function(req, email, password, done){
        if(req.body["g-recaptcha-response"]==''){
            // captcha not selected by user
            req.flash('error','Please select re-captha ');
            return done(null,false);
        }
        // verify captcha
        const response_key = req.body["g-recaptcha-response"];
        const secret_key = process.env.CAPTCHA_SECRET_KEY;
        const url =`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
        try{
            const googgle_responce=await axios.post(url);
            if(googgle_responce.success==false){
                //captcha verification failed
                req.flash('error','re-captcha verification failed ');

                return done(null,false);
                 
            }
        }
        catch(err){
            //console.log(err);
            req.flash('error', err);
            return done(err);
        }
        // find a user and establish the identity
        User.findOne({email: email}, async function(err, user)  {
            if (err){
                //req.flash('error', err);
                req.flash('error', err);
                return done(err);
            }
            if (!user){
                
                //req.flash('error', 'Invalid Username');
                req.flash('error', 'Invalid Username/Password');
                return done(null, false);
            }
            // check user password with hashed password stored in the database
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword){
                // invalid password
                //req.flash('error', 'Invalid Username/Password');
                req.flash('error', 'Invalid Username/Password');
                return done(null, false);
            }

            return done(null, user);
        });
    }


));


// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function(user, done){
    done(null, user.id);
});



// deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if(err){
            console.log('Error in finding user --> Passport');
            return done(err);
        }

        return done(null, user);
    });
});


// check if the user is authenticated
passport.checkAuthentication = function(req, res, next){
    // if the user is signed in, then pass on the request to the next function(controller's action)
    if (req.isAuthenticated()){// if you logged in then passport will add isAuthenticated property to req
        return next();
    }

    // if the user is not signed in
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req, res, next){
    if (req.isAuthenticated()){
        // req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
        res.locals.user = req.user;
    }

    next();
}



module.exports = passport;