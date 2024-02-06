const { Productdb } = require('../../model/adminSide/productModel');

const Categorydb = require('../../model/adminSide/category').Categorydb;

function capitalizeFirstLetter(str) {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    updateCategory: async (req, res) => {
        try {
            req.body.description = req.body.description.trim();
            req.body.name = req.body.name.trim();

            if(!req.body.description){
                req.session.dErr = `This Field is required`;
            }

            if (!req.body.name) {
                req.session.catErr = `This Field is required`;
            }

            if(req.session.dErr || req.session.catErr){
                req.session.sDetails = req.body;
                return res.status(401).json({err: true});
            }

            req.body.name = capitalizeFirstLetter(req.body.name);
            req.body.description = capitalizeFirstLetter(req.body.description);

            const isExisits = await Categorydb.findOne({name: req.body.name});

            if(isExisits && String(isExisits._id) !== req.params.categoryId){
                req.session.catErr = `Category already exist`;
                req.session.sDetails = req.body;
                return res.status(401).json({err: true});
            }

            const oldCategory = await Categorydb.findOneAndUpdate({_id: req.params.categoryId}, {$set: req.body});

            await Productdb.updateMany({category: oldCategory.name}, {$set: {category: req.body.name}});

            res.status(200).json({status: true});
        } catch (err) {
            console.log('put of updateCategory', err);
            res.status(500).json({err});
        }
    },
}