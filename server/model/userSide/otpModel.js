const mongodb = require('mongoose');

const otpSchema = new mongodb.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

const otpdb = mongodb.model('OtpVerificationdbs', otpSchema);

module.exports = otpdb;