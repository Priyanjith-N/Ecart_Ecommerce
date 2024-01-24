const express = require('express');
const router = express.Router();

const errPageRender = require('../../services/errPage/errPageRender');


// for handeling err get reqs
router.all('*', errPageRender.errPage);



module.exports = router;