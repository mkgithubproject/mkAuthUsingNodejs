const express=require('express');
const passport=require('passport');
const router=express.Router();
const usersController=require('../controllers/user_controller');
router.get('/sign-up',usersController.userSingUp);
router.get('/sign-in',usersController.userSingIn);
router.get('/profile',passport.checkAuthentication,usersController.userProfile);
router.post('/create',usersController.create);
router.post('/update-password',usersController.updatePassword);
router.get('/reset-password',usersController.resetPassword);
router.get('/reset-password-notAuth',usersController.resetPasswordNotAuth);
router.post('/send-mail-forResetting-password',usersController.sendMailForResettingPassword);
// use passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
    'local',
    {failureRedirect: '/users/sign-in'},
), usersController.createSession);
router.get('/sign-out', usersController.destroySession);
router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/users/sign-in'}), usersController.createSession);


module.exports=router;