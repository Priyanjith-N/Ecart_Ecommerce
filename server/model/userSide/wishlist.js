const mongodb = require("mongoose");

const wishlistchema = new mongodb.Schema({
  userId: {
    type: mongodb.SchemaTypes.ObjectId,
    required: true,
  },
  products: [
    {
        type: mongodb.SchemaTypes.ObjectId,
        required: true,
    }
  ],
});

const wishlistdb = mongodb.model('wishlistdbs', wishlistchema);

module.exports = wishlistdb;