const User=require('../models/user');
const axios = require('axios');
const bcrypt=require('bcrypt');
const randtoken = require('rand-token');
const forgotPasswordMailer=require('../mailers/forgot_password');
module.exports.userSingUp=function(req,res){
    res.render('signUp',{
    title:"Sign|Up",
    captcha_siteKey:process.env.CAPTCHA_SITE_KEY
    });
    return;
}

module.exports.userSingIn=function(req,res){
    res.render('signIn',{
    title:"Sign|In",
    captcha_siteKey:process.env.CAPTCHA_SITE_KEY});
    return;
}
module.exports.userProfile=function(req,res){
    res.render('profile',{
    title:"profile"});
    return;
}
module.exports.create= async function(req,res){
    if(req.body.psw!=req.body.psw_repeat){
        // password not matched
        req.flash('error', 'Passwords do not match');
        return res.redirect('back');
    }
    if(req.body["g-recaptcha-response"]==''){
        // captcha not selected by user
        req.flash('error', 'Please select re-captcha');

        return res.redirect('back');
    }
    // verify captcha
    const response_key = req.body["g-recaptcha-response"];
    const secret_key = process.env.CAPTCHA_SECRET_KEY;
    const url =`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
    try{
        const googgle_responce=await axios.post(url);
        if(googgle_responce.success==false){
            //captcha verification failed
            req.flash('error', 're-captcha verification failed try again');

            res.redirect('back');
             
        }
    }
    catch(err){
        //console.log(err);
        req.flash('error', err);

        res.redirect('back');

    }
    
    User.findOne({email:req.body.email},async function(err,user){
        if(err){
            req.flash('error', err);
            return;
        }
        if(!user){
            // generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            const password = await bcrypt.hash(req.body.psw, salt);
            // Generate a 16 character alpha-numeric token:
            const token = randtoken.generate(16);
            
            User.create({email:req.body.email,password:password,token:token},function(err,user){
                if(err){
                    req.flash('error', err);
                    return;
                }
                // created user redirect to sign-in
                req.flash('success', 'Sign Up Successfully');

                req.flash('success', 'You have signed up, login to continue!');

                return res.redirect('/users/sign-in');
            })
        }else{
            // already have an account
            req.flash('success', 'You have signed up, login to continue!');
            return res.redirect('back');
        }
    });
    
}
// sign in and create a session for the user
module.exports.createSession = function(req, res){
    req.flash('success', 'Logged in Successfully');
    return res.redirect('/users/profile');
}
module.exports.destroySession = function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'You have logged out!');
        return res.redirect('/');
      });
    
}
module.exports.resetPassword=function(req,res){
    return res.render('resetPassword',{
        title:"reset-password",
        query:req.query,
    });
}
module.exports.resetPasswordNotAuth=function(req,res){
    return res.render('reset_password',{
        title:"Email sent",
    });
}
module.exports.sendMailForResettingPassword=async function(req,res){
    try{
        const user=await User.findOne({email:req.body.email});
        if(!user){
            req.flash("error","User not found!");
            return res.redirect('back');
        }
        const link='http://' + req.headers.host + `/users/reset-password?token=${user.token}&id=${user.id}`;
        const userInfo={'email':req.body.email,'link':link}
        forgotPasswordMailer.resetPassword(userInfo);
        req.flash("success","Mail has been sent check your inbox!");
        return res.redirect('/');
    }
    catch(err){
        req.flash("error",err);
        return res.redirect('back');
    }
    
}
module.exports.updatePassword=async function(req,res){
    if(req.isAuthenticated()){
        if(req.body.psw!=req.body.psw_repeat){
            req.flash("error","password is not matched!");
           return res.redirect('back');
        }
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        const password = await bcrypt.hash(req.body.psw, salt);
        User.findByIdAndUpdate(req.user.id,{password:password},function(err,doc){
            if(err){
                req.flash("error",err);
                return res.redirect('back');
            }
            req.flash("success","password reset succesfully!");
             return res.redirect('/users/profile');
        });
        
    }else{// not authorized user change password by gmail
        const token=req.query.token
        const user_id=req.query.id;
        try{
            const doc= await User.findById(user_id);
            if(doc.token!=token){
                
                req.flash('error','verification failed');
                return res.redirect('/');
            }
            if(req.body.psw!=req.body.psw_repeat){
                req.flash("error","password is not matched!");
               return res.redirect('back');
            }
            // generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            const password = await bcrypt.hash(req.body.psw, salt);
            User.findByIdAndUpdate(user_id,{password:password},function(err,doc){
                if(err){
                    req.flash("error",err);
                    return res.redirect('back');
                }
                req.flash("success","password reset succesfully!");
                return res.redirect('/users/sign-in');
            });

        }catch(err){
            req.flash('error','verification failed');
           return res.redirect('/');
        }
       
    }


    //not authorized ,password will be changed by sending mails

}