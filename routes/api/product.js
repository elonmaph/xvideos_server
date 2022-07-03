var express = require('express');
var router = express.Router();
var Product = require('../../schema/productModel');

const { response } = require('../../src/response');

/*获取产品列表*/
router.get('/', async function (req, res, next) {
    const { type } = req.query;
    let products = await Product.find({ type: parseInt(type) });
    res.send(response(true, products));
});

module.exports = router;
