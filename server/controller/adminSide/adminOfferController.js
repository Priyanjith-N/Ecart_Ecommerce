const adminHelper = require('../../databaseHelpers/adminHelper');

function capitalizeFirstLetter(str) {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    adminAddOffer: async (req, res) => {
        try {
            req.body.productName = req.body.productName?.trim();
            req.body.productName = capitalizeFirstLetter(req.body.productName);
            req.body.category = req.body.category?.trim();
            req.body.discount = req.body.discount?.trim();
            req.body.expiry = req.body.expiry?.trim();

            if(!req.body.productName && !req.body.category){
                req.session.productName = `This Field is required`;
            }

            if(!req.body.category){
                req.session.category = `This Field is required`;
            }

            if(!req.body.discount){
                req.session.discount = `This Field is required`;
            }

            if(!req.body.expiry){
                req.session.expiry = `This Field is required`;
            }

            if(req.body.discount && req.body.discount > 95){
                req.session.discount = `Discount cannot be greater than 95%`;
            }

            if(req.session.productName || req.session.category || req.session.discount || req.session.expiry){
                req.session.savedDetails = req.body;
                return res.status(401).redirect('/adminAddOffer');
            }

            const result = await adminHelper.saveOffer(req.body);

            if(result?.err){
                req.session.productName = result.productName;
                req.session.category = result.category;
                return res.status(401).redirect('/adminAddOffer');
            }

            res.status(200).redirect('/adminOfferManagement');

        } catch (err) {
            console.error('offer controller err in add coupon', err);
            res.status(500).send('Internal server err');
        }
    }
}