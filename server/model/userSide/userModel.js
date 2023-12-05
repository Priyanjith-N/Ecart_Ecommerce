const mongodb = require('mongoose');

const userSchema = new mongodb.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userStatus: {
        type: Boolean,
        required: true
    },
    userLstatus: {
        type: Boolean,
        default: false,
    }
});

const userdb = mongodb.model('Userdbs', userSchema);

module.exports = userdb;