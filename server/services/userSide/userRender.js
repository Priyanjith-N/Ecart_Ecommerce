const axios = require('axios');

module.exports = {
    homePage: async (req, res) => {
        const category = await axios.post(
            `http://localhost:${process.env.PORT}/api/getCategory/1`
        );

        const products = await axios.post(
            `http://localhost:${process.env.PORT}/api/newlyLauched`
        );

        res.status(200).render('userSide/userHome',{category: category.data, newProducts: products.data});
    },
    userLogin: async (req, res) => {
        const category = await axios.post(
            `http://localhost:${process.env.PORT}/api/getCategory/1`
        );
        res.status(200).render('userSide/userLogin', {invalid: req.session.invalidUser, isBlock: req.session.userBlockedMesg,errMesg:{
            email: req.session.email,
            password: req.session.password,
            userInfo: req.session.userInfo
        },category: category.data}, (err, html) => {
            // Handle errors during rendering
            if (err) {
                console.error('Error rendering view:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Delete the invalidUser property from the session after rendering the EJS file
            delete req.session.invalidUser;
            delete req.session.userId;
            delete req.session.verifyEmail;
            delete req.session.userBlockedMesg;
            delete req.session.email;
            delete req.session.password;
            delete req.session.userInfo;

            // Send the rendered HTML to the client
            res.send(html);
        });
    },
    userEmailVerify: async (req, res) => {
        const category = await axios.post(
            `http://localhost:${process.env.PORT}/api/getCategory/1`
        );
        res.status(200).render('userSide/registerEmailVerify', {isUser: req.session.isUser,category: category.data}, (err, html) => {
            if(err){
                console.log(err);
                return res.status(500).send('Internal Server Error');
            }

            delete req.session.isUser;

            res.send(html);
        });
    },
    userRegisterOtpVerify: async (req, res) => {
        const category = await axios.post(
            `http://localhost:${process.env.PORT}/api/getCategory/1`
        );
        res.status(200).render('userSide/registerOtpVerify', {email: req.session.verifyEmail, errorMesg: req.session.otpError, rTime: req.session.rTime,category: category.data}, (err, html) => {
            if(err){
                return res.status(500).send('Internal Error');
            }

            delete req.session.otpError;
            delete req.session.rTime;

            res.send(html);
        });
    },
    userRegister: async (req, res) => {
        const category = await axios.post(
            `http://localhost:${process.env.PORT}/api/getCategory/1`
        );
        res.status(200).render('userSide/userRegister', {userInfo: req.session.userRegister, errMesg: {
            fName: req.session.fName,
            phone: req.session.phone,
            pass: req.session.pass,
            conPass: req.session.conPass,
            bothPass: req.session.bothPass
        }, category: category.data}, (err, html) => {
            if(err){
                console.log('Register Page render Err:',err);
                return res.status(500).send('Internal Error');
            }

            delete req.session.userRegister;
            delete req.session.fName;
            delete req.session.phone;
            delete req.session.pass;
            delete req.session.conPass;
            delete req.session.bothPass;
            delete req.session.verifyOtpPage;

            res.status(200).send(html);
        });
    },
    userForgotPassword: async (req, res) => {
        const category = await axios.post(
            `http://localhost:${process.env.PORT}/api/getCategory/1`
        );
        res.status(200).render('userSide/userLoginForgotPassword', {errorMesg: req.session.emailError, otpErr: req.session.otpError,email: req.session.verifyEmail, rTime: req.session.rTime, category: category.data}, (err, html) => {
            if(err){
                console.log('Register Page render Err:',err);
                return res.status(500).send('Internal Error');
            }

            delete req.session.emailError;
            delete req.session.otpError;
            delete req.session.rTime;

            res.status(200).send(html);
        });
    },
    userResetPassword: async(req, res) => {
        const category = await axios.post(
            `http://localhost:${process.env.PORT}/api/getCategory/1`
        );
        res.status(200).render('userSide/userLoginResetPassword', {error: {
            comErr: req.session.errMesg,
            newPass: req.session.newPass,
            conPass: req.session.conPass
        }, category: category.data}, (err, html) => {
            if(err){
                console.log('UserResetPass err',err);
                return res.status(500).send('Internal Server Error');
            }

            delete req.session.errMesg;
            delete req.session.newPass;
            delete req.session.conPass;

            res.status(200).send(html);
        });
    },
    showProductsCategory: async (req, res) => {
        try {
            const category = await axios.post(
                `http://localhost:${process.env.PORT}/api/getCategory/1`
            );
            const products = await axios.post(`http://localhost:${process.env.PORT}/api/userCategory/${req.params.category}`);

            res.status(200).render('userSide/userSingleCategoryProducts', {products: products.data, category: category.data});
        } catch (err) {
            console.log('Update query err:',err);
            res.status(500).send('Internal server error');
        }
    },
    userProductDetails: async (req, res) => {
        try {
            const category = await axios.post(
                `http://localhost:${process.env.PORT}/api/getCategory/1`
            );
            const product = await axios.post(`http://localhost:${process.env.PORT}/api/getproduct/${req.params.id}`);
            const [singleProduct] = product.data;
            const isCartItem = await axios.post(`http://localhost:${process.env.PORT}/api/getCartItems/${req.params.id}/${req.session.isUserAuth}`);
            res.status(200).render('userSide/userProductDetails', {products: singleProduct, category: category.data, isCartItem: isCartItem.data});
        } catch (err) {
            console.log('Update query err:',err);
            res.status(500).send('Internal server error');
        }
    },
    usersAddToCart: async (req, res) => {
        try {
            const category = await axios.post(
                `http://localhost:${process.env.PORT}/api/getCategory/1`
            );
            const cartItems = await axios.post(
                `http://localhost:${process.env.PORT}/api/getCartAllItem/${req.session.isUserAuth}`
            );
            res.status(200).render('userSide/userAddCart', {category: category.data, cartItems: cartItems.data});
        } catch (err) {
            console.log('Update query err:',err);
            res.status(500).send('Internal server error');
        }
    },
    userProfile: async (req, res) => {
        try {
            const category = await axios.post(
                `http://localhost:${process.env.PORT}/api/getCategory/1`
            );
            const user = await axios.post(
                `http://localhost:${process.env.PORT}/api/userInfo/${req.session.isUserAuth}`
            );
            res.status(200).render('userSide/userProfile', {category: category.data, user: user.data});
        } catch (err) {
            console.log('Update query err:',err);
            res.status(500).send('Internal server error');
        }
    }
}