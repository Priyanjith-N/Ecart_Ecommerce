const categorydb = require('../model/adminSide/category').Categorydb;
const bannerdb = require('../model/adminSide/bannerModel');

module.exports = {
    getCategorydb: async (status) => {
        try {
            return await categorydb.find({status});
        } catch (err) {
            return err;
        }
    },
    addBanner: async (body, largeImg, smallImg) => {
        try {
            const newBanner = new bannerdb({
                name: body.bName,
                description: body.bDescription,
                category: body.category,
                largeScreenImage: largeImg,
                smallScreenImage: smallImg
            });

            return await newBanner.save();
        } catch (err) {
            return err;
        } 
    },
    getBanner: async (status) => {
        try {
            return await bannerdb.find({status});
        } catch (err) {
            return err;
        }
    },
    adminDeleteBanner: async (bannerId, status) => {
        try {
            return await bannerdb.updateOne({_id: bannerId}, {$set: {status: status}});
        } catch (err) {
            return err;
        }
    },
    adminPremenentDeleteBanner: async (bannerId) => {
        try {
            return await bannerdb.deleteOne({_id: bannerId});
        } catch (err) {
            return err;
        }
    }
}