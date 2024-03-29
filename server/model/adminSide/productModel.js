const mongodb = require('mongoose');

const productSchema = new mongodb.Schema({
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
    fPrice: {
        type: Number,
        required: true
    },
    lPrice: {
        type: Number,
        required: true
    },
    offers: [
        {
            type: mongodb.SchemaTypes.ObjectId,
        }
    ],
    newlyLauch: {
        type: Boolean,
        default: false,
        required: true
    },
    unlistedProduct: {
        type: Boolean,
        default: false,
    }
});

const productVariationSchema = new mongodb.Schema({
    productId: {
        type: mongodb.SchemaTypes.ObjectId,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    images: [
        {
            type: String
        }
    ]  
})

const Productdb = mongodb.model('Productdbs', productSchema);

const ProductVariationdb = mongodb.model('ProductVariationdbs', productVariationSchema);

module.exports = {
    Productdb,
    ProductVariationdb
}