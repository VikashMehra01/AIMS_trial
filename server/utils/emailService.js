const nodemailer = require('nodemailer');

// Mock Transporter (Logs to console)
const sendOTP = async (email, otp) => {
    console.log('--------------------------------------------------');
    console.log(`[EMAIL SERVICE] Sending OTP to ${email}`);
    console.log(`[EMAIL SERVICE] Your OTP is: ${otp}`);
    console.log('--------------------------------------------------');

    // In production, you would configure a real transporter here
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });
    return true;
};

module.exports = { sendOTP };
