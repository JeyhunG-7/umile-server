const axios = require('axios');

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { Log } = require('./Logger'),
    logger = new Log('SendGrid');

const EMAIL = {
    noReplyEmail: "noreply@umile.xyz"
}
const TEMPLATE = {
    resetPassword: 'd-42947cc44958448fbf7551c6c9ebf6d1',
    signup: 'd-a7361353f48d4c63bfc5cd6006854927'
}

exports.sendResetPasswordEmail = async function(email, full_name, resetLink){
    var opts = {
        personalizations: [
            {
            to: [
                {
                email: email,
                name: full_name
                }
            ],
            dynamic_template_data: {
                resetLink: resetLink
            }
            }
        ],
        from: {
            email: EMAIL.noReplyEmail
        },
        template_id: TEMPLATE.resetPassword
    }

    try{
        var response = await axios.post('https://api.sendgrid.com/v3/mail/send', opts, {
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
            }
        });
        
        return true;
    } catch(err){
        logger.error(`Error while sending reset password email, ${JSON.stringify(err)}`);
        return false;
    }
}

exports.sendSignupEmail = async function(email, full_name, signupLink){
    var opts = {
        personalizations: [
            {
            to: [
                {
                email: email,
                name: full_name
                }
            ],
            dynamic_template_data: {
                signupLink: signupLink
            }
            }
        ],
        from: {
            email: EMAIL.noReplyEmail
        },
        template_id: TEMPLATE.signup
    }

    try{
        var response = await axios.post('https://api.sendgrid.com/v3/mail/send', opts, {
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
            }
        });
        
        return true;
    } catch(err){
        logger.error(`Error while sending reset password email, ${JSON.stringify(err)}`);
        return false;
    }
}