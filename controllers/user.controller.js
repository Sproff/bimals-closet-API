const User = require('../models/user.model');
const {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
} = require('../validations/user.validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/errorHandler');
const sgMail = require('@sendgrid/mail');

const createUser = async (req, res, next) => {
  try {
    // Validate data
    const data = req.body;
    const { error } = await registerUserSchema.validateAsync(data);
    if (error) throw new ErrorHandler(400, error.message);

    // Verify if email exist
    data.email = data.email.toLowerCase();

    let user = await User.findOne({ email: data.email });
    if (user) throw new ErrorHandler(400, 'Email already exists');

    const salt = await bcrypt.genSalt(8);
    data.password = await bcrypt.hash(data.password, salt);

    // Save user to the DB
    user = await User.create(data);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    next(new ErrorHandler(error.statusCode || 500, error.message));
  }
};

const loginUser = async (req, res, next) => {
  try {
    // Validate data
    const data = req.body;
    const { error } = await loginUserSchema.validateAsync(data);
    if (error) throw new ErrorHandler(400, error.message);

    // Verify email and password
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user)
      throw new ErrorHandler(
        400,
        'User not found, proceed to the registration page'
      );

    const validatePassword = await bcrypt.compare(data.password, user.password);
    if (!validatePassword) throw new ErrorHandler(400, 'Incorrect password');

    // Generate token for access
    const token = jwt.sign({ sub: user._id }, process.env.JWT_TOKEN, {
      expiresIn: '2h',
    });

    // user.token = token;
    // user.save();

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(new ErrorHandler(error.statusCode || 500, error.message));
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = await forgotPasswordSchema.validateAsync(email);
    if (error) throw new ErrorHandler(400, error.message);

    const shortCode = nanoid(6).toUpperCase();

    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare for email
    const emailParams = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
              <html>
                <h1>Reset Password</h1>
                <p>Use this code to reset your password:</p>
                <h2 style="color: red;">${shortCode}</h2>
                <i>Bimal's Closet</i>
              </html>
            `,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Password Reset Request',
        },
      },
    };

    // await SES.sendEmail(emailParams).promise();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email, // Change to your recipient
      from: 'sproff.oluwaseun@gmail.com', // Change to your verified sender
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });

    res.json({
      message:
        'A password reset email has been sent successfully. Please check your inbox for further instructions.',
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};

module.exports = { createUser, loginUser, forgotPassword };
