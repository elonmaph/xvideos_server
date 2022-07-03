var express = require('express');
var router = express.Router();

const { response } = require('../../src/response');

/* 获取元信息 */
router.get('/', async function (req, res, next) {
    let meta = {
        resPrefix:'http://cdn.dl-dealo.com',
        customerUrl:'https://eg.im/douyin520',
        shareUrl:'https://www.okay007.com'
    };
    res.send(response(true, meta));
});

router.get('/update', async function (req, res, next) {
    const {platform} = req.headers;
    let update = {
        version:0,
        meassage:'更新信息',
        mandatory:false,
        url:'https://www.google.com'
    };
    res.send(response(true, update));
});

module.exports = router;