const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Email = (msg) => {
  sgMail.send(msg).then(
    () => {
      return true;
    },
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
        return false;
      }
    },
  );
};

module.exports = { Email };
