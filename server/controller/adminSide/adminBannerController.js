const adminHelper = require("../../databaseHelpers/adminHelper");
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    adminAddBanner: async (req, res) => {
        try {
            if(!req.body.bName){
                req.session.bName = 'This Field is required';
            }
    
            if(!req.body.bDescription){
                req.session.bDescription = 'This Field is required';
            }
    
            if(!req.body.category){
                req.session.category = 'This Field is required';
            }
    
            if(!req.files.largeImg || req.files.largeImg.length === 0){
                req.session.largeImg = 'This Field is required';
            }
    
            if(!req.files.smallImg || req.files.smallImg.length === 0){
                req.session.smallImg = 'This Field is required';
            }
    
            if(req.session.category || req.session.bDescription || req.session.bName){
                req.session.savedInfo = req.body;
                //if large img uploaded it is stored localy so delete it
                if(req.files?.largeImg && req.files?.largeImg?.length !== 0){
                    fs.unlinkSync(path.join(__dirname, '../../../public',`/uploadedImages/${req.files.largeImg[0].filename}`));
                }
                //if small img uploaded it is stored localy so delete it
                if(req.files?.smallImg && req.files.smallImg.length !== 0){
                fs.unlinkSync(path.join(__dirname, '../../../public',`/uploadedImages/${req.files.smallImg[0].filename}`));
                }

                return res.status(401).redirect('/adminAddBanner');
            }

            // crop largeImg
            await sharp(path.join(__dirname, '../../../public',`/uploadedImages/${req.files.largeImg[0].filename}`))
            .resize(2000, 888, {
                fit: "cover",
                position: "centre",
            })
            .toFile(path.join(__dirname, '../../../public',`/uploadedImages/resizedImg${req.files.largeImg[0].filename}`));
        
        
            //crop smallImg
            await sharp(path.join(__dirname, '../../../public',`/uploadedImages/${req.files.smallImg[0].filename}`))
            .resize(822, 1200, {
                fit: "cover",
                position: "centre",
            })
            .toFile(path.join(__dirname, '../../../public',`/uploadedImages/resizedImg${req.files.smallImg[0].filename}`));
    
            const largeImg = `/uploadedImages/resizedImg${req.files.largeImg[0].filename}`;
            const smallImg = `/uploadedImages/resizedImg${req.files.smallImg[0].filename}`;

            await adminHelper.addBanner(req.body, largeImg, smallImg);

            res.status(200).redirect('/adminBannerManagement');
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server err');
        }
    },
    adminDeleteBanner: async (req, res) => {
        try {
            await adminHelper.adminDeleteBanner(req.params.bannerId, false);
            res.status(200).json({
                status: true
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server err');
        }
    },
    adminRestoreBanner: async (req, res) => {
        try {
            await adminHelper.adminDeleteBanner(req.params.bannerId, true);
            res.status(200).json({
                status: true
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server err');
        }
    },
    adminPremenentDeleteBanner: async (req, res) => {
        try {
            await adminHelper.adminPremenentDeleteBanner(req.params.bannerId);
            res.status(200).json({
                status: true
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server err');
        }
    }
}