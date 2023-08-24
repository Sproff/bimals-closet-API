const User = require('../models/user.model');
const {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/user.validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/errorHandler');
const sgMail = require('@sendgrid/mail');
// const { nanoid } = require('nanoid');
const crypto = require('crypto');
const { generateShortCode } = require('../utils/helpers');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Set isVerified to false initially
    data.isVerified = false;

    // Create verification token and store it
    // const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds
    // const verificationToken = `${crypto
    //   .randomBytes(20)
    //   .toString('hex')}.${expirationTime}`;
    // data.verificationToken = verificationToken;



    // Save user to the DB
    user = await User.create(data);

    // Generate token for access
    const verificationToken = jwt.sign({ sub: user._id }, process.env.JWT_TOKEN, {
      expiresIn: '10m',
    });

    const verificationLink = `${process.env.FRONTEND_REDIRECT}/auth/verify-email?token=${verificationToken}&email=${data.email}`;

    // Send verification email
    const sendEmailResult = await sendEmail(data.email, '', verificationLink);

    if (!sendEmailResult) {
      throw new ErrorHandler(500, 'Failed to send email');
    }
    const userJson = user.toJSON();
    delete userJson.password;

    res.status(201).json({
      status: 'success',
      message:
        'User registered successfully. A verification email has been sent.',
      data: userJson,
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

    // Validate email using forgotPasswordSchema
    const { error } = await forgotPasswordSchema.validateAsync(req.body);
    if (error) {
      throw new ErrorHandler(400, error.message);
    }
    const { email } = req.body;
    // Generate a short code for password reset
    // const shortCode = generateShortCode();

    // Find the user and update the password reset code
    const user = await User.findOne({ email });
    // const user = await User.findOneAndUpdate(
    //   { email },
    //   { passwordResetCode: shortCode }
    // );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secretKey = process.env.JWT_TOKEN;
    const token = jwt.sign({ sub: user._id }, secretKey, { expiresIn: '1h' });

    const resetPasswordLink = `${process.env.FRONTEND_REDIRECT}/auth/reset-password?code=${token}`;

    // Send password reset email
    const sendEmailResult = await sendEmail(email, resetPasswordLink);

    if (!sendEmailResult) {
      throw new ErrorHandler(500, 'Failed to send email');
    }

    res.json({
      message:
        'A password reset email has been sent successfully. Please check your inbox for further instructions.',
      status: 'success',
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      error:
        error.message ||
        'An unexpected error occurred. Please try again later.',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate short code and new password
    const { error } = await resetPasswordSchema.validateAsync({
      password: newPassword,
    });
    if (error) {
      throw new ErrorHandler(400, error.message);
    }

    // Verify the reset token
    const secretKey = process.env.JWT_TOKEN;
    const decodedToken = jwt.verify(resetToken, secretKey);
    const userId = decodedToken.sub;

    // Update user's password
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's password
    const salt = await bcrypt.genSalt(8);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successful', status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.params.token;
    // Split the token into the actual token and the expiration timestamp
    // const [expirationTime] = token.split('.');

    // Verify the reset token
    const secretKey = process.env.JWT_TOKEN;
    const decodedToken = jwt.verify(token, secretKey);

    // // Check if the token has expired
    // if (Date.now() > parseInt(expirationTime)) {
    //   throw new ErrorHandler(401, 'Verification token has expired');
    // }

    // Find the user by the token in the database
    const user = await User.findOne({ _id: decodedToken.sub });

    if (!user) {
      throw new Error('User not found');
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verification successful',
    });
  } catch (error) {
    next(error);
  }
};

const sendEmail = async (email, resetPasswordLink, verificationLink) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: !verificationLink
        ? 'Password Reset Request'
        : 'Verify Your Email Address',
      html: `
      <html>
        <body>
          <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a
                  href=""
                  style="font-size:1.4rem;color: #30C376;text-decoration:none;font-weight:600"
                >
                  Bimal's Closet
                </a>
              </div>
              <p style="font-size:1.1rem">Hi, there.</p>
              <p>
                ${
                  verificationLink
                    ? "Thank you for choosing Bimal's Closet. Use the following link to complete your verification processes. Link is valid for 5 minutes"
                    : 'We have received a request to reset the password for your account. To complete the process, please click the link below.'
                }
              </p>
              <p>${!verificationLink ? resetPasswordLink : verificationLink}</p>
              ${
                resetPasswordLink
                  ? `<p>If you did not initiate this request or have any concerns, please disregard this email.</p>`
                  : ''
              }
              
              <p style="font-size:0.9rem;">
                Regards,
                <br />
                Bimal's Closet
              </p>
              <p>Abuja, Nigeria.</p>
              <hr style="border:none;border-top:1px solid #eee" />
            </div>
          </div>
        </body>
      </html>
      `,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = {
  createUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyToken,
};
