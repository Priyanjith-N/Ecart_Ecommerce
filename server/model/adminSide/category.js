const mongodb = require('mongoose');

const categorySchema = new mongodb.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true
    }
});

const Categorydb = mongodb.model('Categorydbs', categorySchema);

module.exports = {
    Categorydb
};