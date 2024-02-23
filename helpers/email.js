const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Email = (msg) => {
  // const msg = {
  //     to: toEmail,
  //     from: 'test@example.com', // Use the email address or domain you verified above
  //     subject: 'Sending with Twilio SendGrid is Fun',
  //     text: 'and easy to do anywhere, even with Node.js',
  //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  //   };
  sgMail.send(msg).then(
    () => {
      console.log('Email sent');
      return 'Email sent successfully';
    },
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
        return 'Something went wrong';
      }
    },
  );
};

module.exports = { Email };
