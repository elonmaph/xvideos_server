var express = require('express');
var router = express.Router();
var Product = require('../../schema/productModel');

const { response } = require('../../src/response');

/*获取VIP充值信息*/
router.get('/rechargeList', async function (req, res, next) {
    let products = await Product.find({ type: parseInt(0) });
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        if (product.channel == 0) {
            product._doc.payType = [{
                type: 0,
                des: '支付宝',
                icon: '/meta/alipay_icon.png'
            }];
        }
        else {
            product._doc.payType = [{
                type: 1,
                des: '微信',
                icon: '/meta/wechatpay_icon.png'
            }];
        }
    }
    res.send(response(true, products));
});

router.get('/coinsList', async function (req, res, next) {
    let products = await Product.find({ type: parseInt(1) });
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        if (product.channel == 0) {
            product._doc.payType = [{
                type: 0,
                des: '支付宝',
                icon: '/meta/alipay_icon.png'
            }];
        }
        else {
            product._doc.payType = [{
                type: 1,
                des: '微信',
                icon: '/meta/wechatpay_icon.png'
            }];
        }
    }
    res.send(response(true, products));
});

module.exports = router;
