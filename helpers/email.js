const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Email = (msg) => {
  sgMail.send(msg).then(
    () => {
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
