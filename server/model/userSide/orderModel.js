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
            orderStatus: {
                type: String,
                default: "pending",
                required: true
            }
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
    addressId: {
        type: mongodb.SchemaTypes.ObjectId,
        required: true,
    }
});

const Orderdb = mongodb.model('orderdbs', orderSchema);

module.exports = Orderdb;