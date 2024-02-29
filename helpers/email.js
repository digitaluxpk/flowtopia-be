const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Email = async (msg) => {
    try {
        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body);
        }
        return false;
    }
};

module.exports = { Email };
