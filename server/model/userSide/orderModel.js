const mongodb = require('mongoose');

const orderSchema = new mongodb.Schema({
    userId: {
        type: mongodb.SchemaTypes.ObjectId,
        required: true,
    },
    orderItems: [
        {
            productId: {
                type: mongodb.SchemaTypes.ObjectId,
                required: true,
            },
            pName: {
                type: String,
                required: true
            },
            category: {
                type: String,
                required: true
            },
            sTittle: {
                type: String,
                required: true
            },
            hDescription: {
                type: String,
                required: true
            },
            pDescription: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            fPrice: {
                type: Number,
                required: true
            },
            lPrice: {
                type: Number,
                required: true
            },
            color: {
                type: String,
                required: true
            },
            images: {
                type: String
            },
            orderStatus: {
                type: String,
                default: "Ordered",
                required: true
            },
        }
    ],
    paymentMethode: {
        type: String,
        required: true 
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    address: {
        type: String,
        required: true,
    }
});

const Orderdb = mongodb.model('orderdbs', orderSchema);

module.exports = Orderdb;