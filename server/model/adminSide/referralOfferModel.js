const mongoose = require('mongoose');

const referralOfferSchema = new mongoose.Schema({
    referralRewards: {
        type: Number,
        required: true
    },
    referredUserRewards: {
        type: Number,
        required: true
    },
    discription: {
        type: String
    },
    expiry: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('refferalOfferdbs', referralOfferSchema);