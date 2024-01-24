const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv').config();
const morgan = require('morgan');
const flash = require('express-flash');

const app = express();

const userSideRouter = require('./server/router/userSide/userRouter');
const adminSideRouter = require('./server/router/adminSide/adminRouter');
const errPageRouter = require('./server/router/errPage/errPageRouter');

const connectDB = require('./server/database/connection');

connectDB();

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(flash());

app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
    res.setHeader("Pragma", "no-cache"); 
    res.setHeader("Expires", "0");
    next()
});

app.use(session({
    secret: process.env.sessionSecrect,
    resave:false,
    saveUninitialized: true
})); 

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/', userSideRouter);

app.use('/', adminSideRouter);

app.use('/', errPageRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));