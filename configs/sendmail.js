var nodemailer = require('nodemailer');
// const base64 = require('base-64');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type : 'OAuth2',
        user: "abhay.sehgal2012@gmail.com",
        clientId : "538233157835-nbtli6hg0bnrnc6jqjj12oh8igbkb0n6.apps.googleusercontent.com",
        clientSecret : "5Md4PIzb13oAAd_IG8nwmw0_",
        refreshToken:"1/9fFktO0r2P0CPj0dWyY9oLcXvZxXeTveXnBzZT6V-2M",
        accessToken:"ya29.GltRBXEnGBF0DyG8EtKmXDsKScTfsfTiLobWsTlLorqDQaEqfozzdGLTLxOSqC6afp1h8cG94zh-PM4TWJ4Ai_V_VNAs4Dsdo0Etx26HyH8h9rrcoof8jIftreCe",
        expires:1517225593840   
    }
});

exports = module.exports = (to,subject,text,path,res) => {
    mailOptions = {
        from : 'no-reply@application.com' ,
        to,
        subject,
        text,
        html: ``,
        attachments : [
            {
                filename : 'test.pdf',
                path
            }
        ]
    }
    // console.log(mailOptions);
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            response.json({ devMessage : "error", mesage : "Unsuccess"});
        } else {
            console.log("Message sent: " + response.message);
            response.json(res);
        }
    });
}