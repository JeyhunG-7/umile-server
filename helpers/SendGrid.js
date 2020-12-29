const axios = require('axios');
const sgMail = require('@sendgrid/mail')
process.env.SENDGRID_API_KEY="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";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const EMAIL = {
    noReplyEmail: "noreply@umile.xyz"
}
const TEMPLATE = {
    resetPassword: 'd-42947cc44958448fbf7551c6c9ebf6d1'
}

const msg = {
    to: 'test@example.com', // Change to your recipient
    from: 'test@example.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })

const sendResetPasswordEmail = async function(email, full_name, resetLink){
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
        console.log('RESPONSE: ', response);
    } catch(err){
        console.log('ERROR: ', err);
    }
}

sendResetPasswordEmail('jeyhun.j.gurbanov@gmail.com', 'Jeyhun Gurbanov', 'https://arvel.app');