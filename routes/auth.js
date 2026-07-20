const express = require('express');
const router = express.Router();
const { register, login , getCurrentUser,forgotPassword,verifyOtp,resetPassword} = require('../controllers/auth');
const isUser=require('../middleware/user')
router.post('/register', register);
router.post('/login', login);
router.get('/me', isUser, getCurrentUser);


router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
module.exports = router;