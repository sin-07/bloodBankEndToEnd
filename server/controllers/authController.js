const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { sendEmail } = require('../utils/emailService');
const { welcomeEmail, loginAlertEmail, passwordChangedEmail } = require('../utils/emailTemplates');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, city, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'donor',
      phone,
      city,
      address,
    });

    // If registering as donor, create donor profile
    if (user.role === 'donor' && req.body.bloodGroup) {
      await Donor.create({
        userId: user._id,
        bloodGroup: req.body.bloodGroup,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        weight: req.body.weight,
      });
    }

    // If registering as hospital, create hospital profile
    if (user.role === 'hospital' && req.body.hospitalName) {
      await Hospital.create({
        userId: user._id,
        hospitalName: req.body.hospitalName,
        registrationNumber: req.body.registrationNumber,
        type: req.body.hospitalType,
        city: city,
        state: req.body.state,
        address: address,
        contactPerson: {
          name: name,
          phone: phone,
          email: email,
        },
      });
    }

    // Generate token
    const token = user.generateToken();

    // Send welcome email
    const emailData = welcomeEmail({ name: user.name, role: user.role, loginUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login` });
    sendEmail({ to: user.email, subject: emailData.subject, html: emailData.html }).catch(err => console.error('Welcome email error:', err));

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Contact admin.',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = user.generateToken();

    // Send login alert email
    const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const loginData = loginAlertEmail({ name: user.name, time: loginTime, ip: req.ip || req.connection?.remoteAddress });
    sendEmail({ to: user.email, subject: loginData.subject, html: loginData.html }).catch(err => console.error('Login alert email error:', err));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          city: user.city,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    let profile = null;
    if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, city, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.generateToken();

    // Send password changed email
    const pwData = passwordChangedEmail({ name: user.name });
    sendEmail({ to: user.email, subject: pwData.subject, html: pwData.html }).catch(err => console.error('Password change email error:', err));

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
