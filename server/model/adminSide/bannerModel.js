const mongodb = require('mongoose');

const bannerSchema = new mongodb.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    largeScreenImage: {
        type: String,
        required: true,
    },
    smallScreenImage:{
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    }
});

const bannerdb = mongodb.model('bannerdbs', bannerSchema);

module.exports = bannerdb;