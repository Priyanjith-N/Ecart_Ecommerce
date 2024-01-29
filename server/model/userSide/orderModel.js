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
            offerDiscountAmount: {
                type: Number,
                default: 0,
            },
            images: {
                type: String
            },
            orderStatus: {
                type: String,
                default: "Ordered",
                required: true
            },
            couponDiscountAmount: {
                type: Number,
                default: 0,
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
    amountTakenFromWallet: {
        type: Number,
        default: 0,
    },
    address: {
        type: String,
        required: true,
    }
});

const Orderdb = mongodb.model('orderdbs', orderSchema);

module.exports = Orderdb;