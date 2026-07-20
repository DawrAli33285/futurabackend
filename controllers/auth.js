const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const usersmodel = require('../models/users');

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';


const nodemailer = require("nodemailer");
const otpModel = require("../models/otp");



const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
  };
  


const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email and password are required' });
        }

        const existingUser = await usersmodel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }

        const hashedPassword = await argon2.hash(password);

        const newUser = await usersmodel.create({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Something went wrong during registration' });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const user = await usersmodel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Something went wrong during login' });
    }
};





const getCurrentUser = async (req, res) => {
    try {
       
        return res.status(200).json({
            id: req.user.id
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};













const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: `"Futura Research" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div style="margin:0; padding:0; background-color:#050807; font-family: 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050807; padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:16px; overflow:hidden;">
                  <tr>
                    <td align="center" style="padding:32px; border-bottom:1px solid rgba(255,255,255,0.08);">
                      <div style="color:#ffffff; font-size:20px; font-weight:600;">Futura Research</div>
                      <div style="color:#14b8a6; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; margin-top:4px;">
                        Password Reset Request
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px; text-align:center;">
                      <p style="color:#e5e7eb; font-size:14px; margin:0 0 20px 0;">
                        Use the code below to reset your password. This code expires in 10 minutes.
                      </p>
                      <div style="display:inline-block; background-color:rgba(20,184,166,0.1); border:1px solid rgba(20,184,166,0.4); border-radius:10px; padding:16px 32px;">
                        <span style="color:#14b8a6; font-size:32px; font-weight:700; letter-spacing:6px;">${otp}</span>
                      </div>
                      <p style="color:#6b7280; font-size:12px; margin-top:20px;">
                        If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
  
      const user = await usersmodel.findOne({ email });
  
    
      if (!user) {
        return res.status(200).json({
          message: "If an account with this email exists, an OTP has been sent.",
        });
      }
  
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
  
      await otpModel.deleteMany({ email });
      await otpModel.create({ email, otp, expiresAt });
  
      await sendOtpEmail(email, otp);
  
      return res.status(200).json({
        message: "If an account with this email exists, an OTP has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };
  
  const verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }
  
      const otpRecord = await otpModel.findOne({ email, otp });
  
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
  
      if (otpRecord.expiresAt < new Date()) {
        await otpModel.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "OTP has expired" });
      }
  
      return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };
  
  const resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
  
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP and new password are required" });
      }
  
      const otpRecord = await otpModel.findOne({ email, otp });
  
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
  
      if (otpRecord.expiresAt < new Date()) {
        await otpModel.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "OTP has expired" });
      }
  
      const user = await usersmodel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const hashedPassword = await argon2.hash(newPassword);
      user.password = hashedPassword;
      await user.save();
  
    
      await otpModel.deleteOne({ _id: otpRecord._id });
  
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };
  

module.exports = {  register,
    login,
    getCurrentUser,
    forgotPassword,
    verifyOtp,
    resetPassword};