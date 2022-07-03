var express = require('express');
var router = express.Router();
const axios = require('axios');
const { nanoid } = require('nanoid')
const crypto = require('crypto');
const qs = require('qs');
var ObjectID = require('mongodb').ObjectID;

var Product = require('../../schema/productModel');
var Order = require('../../schema/orderModel');
var User = require('../../schema/userModel');
var Video = require('../../schema/videoModel');
const CoinVideoRecModel = require('../../schema/coinVideoRecModel');
const { response } = require('../../src/response');

function getTimeInfo() {
    let nTimeStamps = Math.floor(Date.now() / 1000);
    let date = new Date(nTimeStamps * 1000);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

/* 下订单 */
router.post('/', async function (req, res, next) {
    const { type, product_id } = req.body;
    let product = await Product.findById(product_id);

    let order_id = nanoid(20);
    let applydate = getTimeInfo();
    let amount = parseInt(product.price);
    let notifyurl = 'http://154.55.128.46:3300/api/order/server';
    let callbackurl = 'http://154.55.128.46:3300/api/order/page';
    let productname = product.title;
    let memberid = '211176378';
    let bankcode = '911';
    let key = 'evyll2vyz9r80kgyrztfpe5c1wl5nr41';
    let order_info = {
        pay_memberid: memberid,
        pay_orderid: order_id,
        pay_applydate: applydate,
        pay_bankcode: bankcode,
        pay_notifyurl: notifyurl,
        pay_callbackurl: callbackurl,
        pay_amount: `${amount}`,
        pay_productname: productname
    };

    let signTemp = `pay_amount=${amount}&pay_applydate=${applydate}&pay_bankcode=${bankcode}&pay_callbackurl=${callbackurl}&pay_memberid=${memberid}&pay_notifyurl=${notifyurl}&pay_orderid=${order_id}&key=${key}`;

    let hash = crypto.createHash('md5');
    let md5String = hash.update(signTemp).digest('hex').toUpperCase();
    let order_sign_info = Object.assign({}, order_info, { pay_md5sign: md5String });
    console.log(order_sign_info);

    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(order_sign_info),
        url: 'http://pay.waimeipay.com/Pay_Index.html'
    };
    let resp = await axios(options);

    console.log(resp.data);
    if (resp.data.code == 200) {
        let order = new Order({
            title: product.title,
            user_id: req.user.user_id,
            type: type,
            price: parseInt(product.price),
            channel: 0,
            order_id: order_id,
            product_id: product_id,
            create_time:Math.floor(Date.now() / 1000)
        });
        await order.save();
        res.send(response(true, resp.data.data));
    }
    else {
        res.send(response(false));
    }
});

/*获取vip和钻石充值订单*/
router.get('/', async function (req, res, next) {
    let { type } = req.query;
    let orders = await Order.find({ type: parseInt(type), user_id: req.user.user_id }, { __v: 0 }, { sort: { _id: -1 } });
    res.send(response(true, orders));
});

/*消费记录*/
router.get('/expense', async function (req, res, next) {
    let records = [];
    records = await CoinVideoRecModel.find({ user: ObjectID(req.user.user_id) }, { __v: 0 }, { sort: { _id: -1 } });

    let resp = [];
    for (let i = 0; i < records.length; i++) {
        let video_id = records[i].video;
        let video = await Video.findOne({ _id: video_id }, { title: 1, coin: 1 });
        video._doc.order_id = records[i]._id.toString();
        resp.push(video);
    }
    res.send(response(true, resp));
});

router.post('/server', async function (req, res, next) {
    console.log('/order/server ==>');
    console.log(req.body);
    let { orderid, returncode } = req.body;
    await Order.findOneAndUpdate({ order_id: orderid }, { $set: { status: returncode == '00' ? 1 : -1 } });
    if (returncode == '00') {
        let order = await Order.findOne({ order_id: orderid, status: 0 });
        if (order) {
            let product = await Product.findById(order.product_id);
            if (order.type == 0) {
                //vip充值
                let bonus = product.bonus;
                let vip_ex = Math.floor(Date.now() / 1000) + product.valid_days * 24 * 60 * 60;
                await User.findByIdAndUpdate(order.user_id, { $set: { vip: 1, vip_ex: parseInt(vip_ex), vip_tag: product.title } });
                await User.findByIdAndUpdate(order.user_id, { $inc: { coins: parseInt(bonus) } });
            }
            else {
                //钻石购买
                let coins = product.coins;
                let bonus = product.bonus;
                let incCoins = parseInt(coins) + parseInt(bonus);
                await User.findByIdAndUpdate(order.user_id, { $inc: { coins: incCoins } });
            }
        }
    }

    res.send('ok');
});

router.post('/page', async function (req, res, next) {
    console.log('/order/page ==>');
    console.log(req.body);
    res.send('ok');
});

module.exports = router;