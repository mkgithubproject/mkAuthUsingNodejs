const nodeMailer = require('../config/nodemailer');


// this is another way of exporting a method
exports.resetPassword = (user) => {
    let htmlString = nodeMailer.renderTemplate({user}, '/forgotPassword/forgot_password.ejs');
   
    nodeMailer.transporter.sendMail({
       from: process.env.SMTP_USER,
       to: user.email,
       subject: "Change Password!",
       html: htmlString
    }, (err, info) => {
        if (err){
            console.log('Error in sending mail', err);
            return;
        }

         //console.log('Message sent', info);
        return;
    });
}