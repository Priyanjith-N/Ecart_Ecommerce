const adminHelper = require('../../databaseHelpers/adminHelper');

function capitalizeFirstLetter(str) {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    addReferralOffer: async (req, res) => {
        try {
            console.log(req.body);
            req.body.referralRewards = req.body.referralRewards.trim();
            req.body.referredUserRewards = req.body.referredUserRewards.trim();
            req.body.discription = req.body.discription.trim();
            req.body.expiry = req.body.expiry.trim();
            
            if(!req.body.referredUserRewards){
                req.session.referredUserRewards = `This Field is required`
            }
            
            if(!req.body.referralRewards){
                req.session.referralRewards = `This Field is required`;
            }

            if(req.body?.referralRewards && req.body?.referredUserRewards && req.body?.referralRewards <= req.body?.referredUserRewards){
                req.session.referralRewards = `Referral Price Need to be greater`;
            }
            
            if(!req.body.discription){
                req.session.discription = `This Field is required`;
            }
            
            if(!req.body.expiry){
                req.session.expiry = `This Field is required`;   
            }

            if(req.session.expiry || req.session.discription || req.session.referralRewards || referredUserRewards){
                req.session.sDetails = req.body;
                return res.status(401).redirect('/addReferralOffer');
            }

            req.body.discription = capitalizeFirstLetter(req.body.discription);

            await adminHelper.addReferralOffer(req.body);
            res.status(200).redirect('/adminReferralOfferManagement');
        } catch (err) {
            console.error('Referral Save err', err);
            res.status(500).send('Internal Server Err');
        }
    }
}