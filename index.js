const express=require('express');
const cookieParser=require('cookie-parser');
const app=express();
const port=8000;
require('dotenv').config();
const path=require('path');
const db=require('./config/mongoose');
// used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

const flash=require('connect-flash')
const customSetFlashMWare=require('./config/flashMiddlleWare');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    name: 'mkAuth',
    // TODO change the secret before deployment in production mode
    secret:process.env.session_cookie_key,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    }}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customSetFlashMWare.setFlash);
app.use('/', require('./routes'));
app.use(express.static('assets'));
app.listen(process.env.PORT || port,(err)=>{
    if(err){
        console.log(`Error in running the server: ${err}`);
        return;
    }
    console.log(`Server is running on port ${process.env.port}`);
});
// use express router











