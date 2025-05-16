import userModel from '../models/userModel.js';
import JWT from 'jsonwebtoken';
import orderModel from '../models/orderModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@agrigrow.com',
    to: email,
    subject: 'AgriGrow - Email Verification',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2b8a3e; text-align: center;">Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for registering with AgriGrow. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2b8a3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This verification link is valid for 24 hours.</p>
        <p>If you didn't create an account with AgriGrow, please ignore this email.</p>
        <p>Thanks,<br>The AgriGrow Team</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Register user with email verification
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // Enhanced validation
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password should be at least 6 characters long' });
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address is required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    
    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Token expires in 24 hours
    
    // Create new user - not verified yet
    const user = await new userModel({
      name,
      email,
      password,
      phone,
      address,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: verificationExpires
    }).save();
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }
    
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      verificationToken // Include token in response for testing purposes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in registration',
      error: error.message,
    });
  }
};

// Verify email token
export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    // Find user with this token
    const user = await userModel.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }  // Token must not be expired
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in to your account.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

// Resend verification email
export const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find user
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }
    
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Token expires in 24 hours
    
    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationExpires;
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error resending verification email',
      error: error.message
    });
  }
};

// Login user with verification check
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found. Please register.' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for a verification link.'
      });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Generate JWT token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isSeller: user.isSeller,
        sellerStatus: user.sellerStatus,
        isVerified: user.isVerified
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message,
    });
  }
};

// Test controller
export const testController = (req, res) => {
  res.json({ message: 'Protected route' });
};

// Get user profile
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching user profile',
      error,
    });
  }
};

// Update profile with enhanced validation
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Validate email if provided
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide a valid email address' 
        });
      }
      
      // Check if new email is already in use
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email is already in use by another account' 
        });
      }
    }
    
    // Validate password if provided
    if (password && password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    // Update user
    const updatedFields = {
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      address: address || user.address,
    };
    
    // Only update password if a new one is provided
    if (password) {
      // We'll use the pre-save hook to hash the password
      user.password = password;
      await user.save();
    }
    
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      updatedFields,
      { new: true }
    ).select('-password');
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in updating profile',
      error: error.message,
    });
  }
};

// Get user orders
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
      .populate('products', '-image')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching orders',
      error,
    });
  }
}; 