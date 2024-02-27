const { Email } = require('../helpers/email');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ status: 400, message: 'All fields are required' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ status: 400, message: 'User already exists' });
    } else {
      const code = Math.floor(Math.random() * 9000) + 1000;
      const msg = {
        to: email,
        from: process.env.ADMINEMAIL,
        subject: 'Email Confirmation Code',
        text: `Your confirmation code is ${code}`,
        html: `Welcome to our website, Your confirmation code is <strong>${code}</strong>`,
      };
      const result =  Email(msg);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await new User({
        name,
        email,
        password: hashedPassword,
        confirmedCode: code,
        isConfirmed: false,
      });
      await user.save();

      return res.status(200).json({
        status: 200,
        message: 'User registered successfully Check your Email',
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const confirmedCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email || !code) {
      res.status(400).json({ status: 400, message: 'All fields are required' });
    }

    const user = await User.findOne({ email, confirmedCode: code });

    if (user) {
      user.isConfirmed = true;
      await user.save();

      res
        .status(200)
        .json({ status: 200, message: 'User confirmed successfully' });
    } else {
      res.status(400).json({ status: 400, message: 'Invalid code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ status: 400, message: 'All fields are required' });
  }
  const user = await User.findOne({ email });

  if (user) {
    if (!user.isConfirmed) {
      return res
        .status(400)
        .json({ status: 400, message: 'User Email is not confirmed' });
    } else {
      res.status(400).json({ status: 400, message: 'Email not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 400, message: 'Wrong password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user._doc.password;
    res.status(200).json({ status: 200, token, user });
  } else {
    res.status(400).json({ status: 400, message: 'Email not found' });
  }
};
module.exports = {
  userRegister,
  confirmedCode,
  userLogin,
};
