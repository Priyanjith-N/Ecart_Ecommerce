const { default: mongoose } = require('mongoose');
const Wishlistdb = require('../model/userSide/wishlist');
const Productdb = require('../model/adminSide/productModel').Productdb;
const Orderdb = require('../model/userSide/orderModel');
const Userdb = require('../model/userSide/userModel');
const userVariationdb = require('../model/userSide/userVariationModel');
const { ProductVariationdb } = require('../model/adminSide/productModel');
const Cartdb = require('../model/userSide/cartModel');
const Categorydb = require('../model/adminSide/category').Categorydb;

module.exports = {
    addProductToWishList: async (userId, productId) => {
        try {
            const product = await Productdb.findOne({_id: productId});

            if(!product) {
                return;
            }

            return await Wishlistdb.updateOne({userId: userId}, {$push: {
                products: productId
            }}, { upsert: true });
        } catch (err) {
            throw err;
        }
    },
    getWishlistItems: async (userId) => {
        try {
            if(!userId){
                return null;
            }
            return await Wishlistdb.findOne({userId: userId});
        } catch (err) {
            throw err;
        }
    },
    removeWishlistItems: async (userId,productId) => {
        try {
            if(!userId){
                return null;
            }
    
            return await Wishlistdb.updateOne({userId: userId}, {$pull: {products: productId}});
        } catch (err) {
            throw err;
        }
    },
    getSingleProducts: async (productId = null) => {
        try {
            return await Productdb.aggregate([
                {
                    $match: {
                    _id: new mongoose.Types.ObjectId(productId),
                    },
                },
                {
                    $lookup: {
                    from: "productvariationdbs",
                    localField: "_id",
                    foreignField: "productId",
                    as: "variations",
                    },
                },
            ]);
        } catch (err) {
            throw err;
        }
    },
    isOrdered: async (productId, userId, orderId = null) => {
        try {
            if(orderId){
                const isOrder = await Orderdb.findOne({_id: orderId,userId: userId, "orderItems.productId": productId, "orderItems.orderStatus": "Delivered"});

                if(!isOrder){
                    return null;
                }

                const dOrders = isOrder.orderItems.filter(value => (value.orderStatus) === 'Delivered' );

                if(dOrders.length === 0){
                    return null;
                }
                
                isOrder.orderItems = dOrders;

                return isOrder;
            }

            const isOrder = await Orderdb.findOne({userId: userId, "orderItems.productId": productId, "orderItems.orderStatus": "Delivered"});

            return isOrder;
        } catch (err) {
            throw err;
        }
    },
    userInfo: async (userId) => {
        try {
            const agg = [
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(userId),
                  },
                },
                {
                  $lookup: {
                    from: "uservariationdbs",
                    localField: "_id",
                    foreignField: "userId",
                    as: "variations",
                  },
                },
              ];
              const user = await Userdb.aggregate(agg);
              return user[0];
        } catch (err) {
            throw err;
        }
    },
    userOrderCancel: async (orderId, productId) => {
        try {
            //updating orderStatus to cancelled
            const order = await Orderdb.findOneAndUpdate({
                $and:[
                    {_id: orderId}, {"orderItems.productId": productId}
                ]
            },
            {$set: {
                "orderItems.$.orderStatus": "Cancelled"
            }});

            // find the product doc to get the qty ordered
            const qty = order.orderItems.find(value => {
                if(String(value.productId) === productId){
                    return value.quantity;
                }
            })

            // updating product quantity
            await ProductVariationdb.updateOne({productId: productId},
                {$inc:{
                    quantity: qty.quantity
                }});

            return;
        } catch (err) {
            throw err;
        }
    },
    getCartItemsAll: async (userId) => {
        try {
            const agg = [
                {
                  $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                  },
                },
                {
                  $unwind: {
                    path: "$products",
                  },
                },
                {
                  $lookup: {
                    from: "productdbs",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "pDetails",
                  },
                },
                {
                  $match: {
                    "pDetails.unlistedProduct": false,
                  },
                },
                {
                  $lookup: {
                    from: "productvariationdbs",
                    localField: "products.productId",
                    foreignField: "productId",
                    as: "variations",
                  },
                },
              ];
              
              //to get all product in cart with all details of produt
              return await Cartdb.aggregate(agg);
        } catch (err) {
            throw err;
        }
    },
    userSingleProductCategory: async (category, search = null) => {
        try {
          const agg = [
            {
              $match: {
                category: category,
                unlistedProduct: false,
              },
            },
            {
              $lookup: {
                from: "productvariationdbs",
                localField: "_id",
                foreignField: "productId",
                as: "variations",
              },
            },
          ];

          // if there is both min and max for product price
          if(Number(search.minPrice) && Number(search.maxPrice)) {
            agg.splice(1,0, {
              $match: {
                $and: [
                  {
                    lPrice: {$gte: Number(search.minPrice)}
                  },
                  {
                    lPrice:{$lte: Number(search.maxPrice)}
                  }
                ]
              },
            });
          }

          //if there is only max for filter
          if(!Number(search.minPrice) && Number(search.maxPrice)) {
            agg.splice(1,0, {
              $match: {
                lPrice: {$lte: Number(search.maxPrice)}
              },
            });
          }

          //if there is only min for filter
          if(Number(search.minPrice) && !Number(search.maxPrice)) {
            agg.splice(1,0, {
              $match: {
                lPrice: {$gte: Number(search.minPrice)}
              },
            });
          }

          //Price Sort
          if(Number(search.sort)){
            agg.splice(1,0, {
              $sort: {
                lPrice: Number(search.sort)
              },
            });
          }

          // aggregatng to get all product details of selected category
          return await Productdb.aggregate(agg);
        } catch (err) {
            throw err;
        }
    },
    getProductDetails: async(productId, newlyLauched = false) => {
        try {
            //for geting newly launched product in home page
            if(newlyLauched){
                return await Productdb.aggregate([
                    {
                      $match: {
                        newlyLauch: true,
                        unlistedProduct: false,
                      },
                    },
                    {
                      $lookup: {
                        from: "productvariationdbs",
                        localField: "_id",
                        foreignField: "productId",
                        as: "variations",
                      },
                    },
                  ]);
            }

            //aggregating to get the details of a single product
            return await Productdb.aggregate([
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(productId),
                  },
                },
                {
                  $lookup: {
                    from: "productvariationdbs",
                    localField: "_id",
                    foreignField: "productId",
                    as: "variations",
                  },
                },
              ]);
        } catch (err) {
            throw err;
        }
    },
    isProductCartItem: async (productId, userId) => {
        try {
            //if user is not logged in it should show add to cart button for user in product detail page
            if(!userId){
                return false;
            }

            //querying in order to cheack if the product is already exists in user cart
            const isCartItem = await Cartdb.findOne({$and:[{userId: userId, "products.productId": productId}]});

            return isCartItem?true:false;
        } catch (err) {
            throw err;
        }
    },
    getAllListedCategory: async () => {
        try {
            //return all listed category
            return await Categorydb.find({status: true});
        } catch (err) {
            throw err;
        }
    },
    getUserInfo: async (userId) => {
        try {
            const agg = [
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(userId),
                  },
                },
                {
                  $lookup: {
                    from: "uservariationdbs",
                    localField: "_id",
                    foreignField: "userId",
                    as: "variations",
                  },
                },
              ];
              
              //aggregate to get full details of user includeing all address
              return await Userdb.aggregate(agg);
        } catch (err) {
            throw err;
        }
    },
    getSingleAddress: async (userId, addressId) => {
      try {
        const address = await userVariationdb.findOne({$and:[{userId: userId}, {"address._id": addressId}]});

        return address?.address?.find(value => {
          return String(value._id) === String(addressId)
        });
      } catch (err) {
        throw err;
      }
    },
    userGetAllOrder: async (userId, pageNo = 1) => {
      try {
        const skip = Number(pageNo)?(Number(pageNo) - 1):0;
        const totalOrders = await Orderdb.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: "$orderItems",
            },
          }
        ]);
        console.log(totalOrders);
        const agg = [
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $sort: {
              orderDate: -1
            }
          },
          {
            $unwind: {
              path: "$orderItems",
            },
          },
          {
            $skip: (10 * skip)
          },
          {
            $limit: 10
          }
        ];
  
        const orders = await Orderdb.aggregate(agg);
        
        return {
          orders,
          totalOrders: totalOrders.length
        }
      } catch (err) {
        throw err;
      }
    },
    getTheCountOfWhislistCart: async (userId) => {
      try {
        // if user is not logged in don't need to show the count of the product in cart or whishlist
        if(!userId){
          return {
            wishlistCount: false,
            cartCount: false,
          }
        }
  
        // querying to find user whislist doc
        const whislistCount = await Wishlistdb.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $lookup: {
              from: "productdbs",
              localField: "products",
              foreignField: "_id",
              as: "pDetails",
            },
          },
          {
            $match: {
              "pDetails.unlistedProduct": false,
            },
          },
        ]);
        
        // querying to find user cart doc
        const cartCount = await Cartdb.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $lookup: {
              from: "productdbs",
              localField: "products.productId",
              foreignField: "_id",
              as: "pDetails",
            },
          },
          {
            $match: {
              "pDetails.unlistedProduct": false,
            },
          },
        ]);
  
        //return as objects with how many products are there
        return {
          whislistCount: whislistCount.length,
          cartCount: cartCount.length,
        }
      } catch (err) {
        throw err;
      }
    }
}