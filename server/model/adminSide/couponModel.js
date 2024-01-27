const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    minPrice: {
        type: Number,
        required: true
    },
    expiry: {
        type: Date,
        required: true 
    }
});

const coupondb = mongoose.model('coupondbs', couponSchema);

module.exports = coupondb;