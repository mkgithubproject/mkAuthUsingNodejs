const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path')
let transporter = nodemailer.createTransport(
    {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMPTP_USER_PASSWORD,
        }
    }
);
// for rendering template
let renderTemplate = (data, relativePath) => {
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname, '../views/mailers', relativePath),
        data,
        function(err, template){
         if (err){console.log('error in rendering template', err); return}
         
         mailHTML = template;
        }
    )

    return mailHTML;
}


module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate
}