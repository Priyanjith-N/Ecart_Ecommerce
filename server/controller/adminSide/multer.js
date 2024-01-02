const Multer = require('multer');
const path = require('path');

const storage = Multer.diskStorage({
    destination: (req, file, callBack) => {
        const publicDir = path.join(__dirname,'../../../','public');
        const destinationPath = path.join(publicDir,'uploadedImages');
        callBack(null, destinationPath);
    },
    filename: (req, file, callBack) => {
        const extenction = file.originalname.substring(file.originalname.lastIndexOf('.'));
        callBack(null, `${file.fieldname}-${Date.now()}${extenction}`);  
    }
});


module.exports = store = Multer({storage});