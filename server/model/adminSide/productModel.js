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
    newlyLauch: {
        type: Boolean,
        default: false,
        required: true
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

const unlistedProductSchema = new mongodb.Schema({
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
    newlyLauch: {
        type: Boolean,
        default: false,
        required: true
    }
});

const unlistedProductVariationSchema = new mongodb.Schema({
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

const UlistedProductdb = mongodb.model('UnlistedProductdbs', unlistedProductSchema);

const ProductVariationdb = mongodb.model('ProductVariationdbs', productVariationSchema);

const UnlistedProductVariationdb = mongodb.model('UnlistedProductVariationdbs', unlistedProductVariationSchema);

module.exports = {
    Productdb,
    ProductVariationdb,
    UlistedProductdb,
    UnlistedProductVariationdb
}