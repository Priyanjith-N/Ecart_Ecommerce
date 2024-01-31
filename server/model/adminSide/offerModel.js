const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    productName: {
        type: String,
    },
    category: {
        type: String,
    },
    discount: {
        type: Number,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('offerdbs', offerSchema);