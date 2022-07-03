var express = require('express');
var router = express.Router();

const { response } = require('../../src/response');

/* 获取约会列表*/
router.get('/', async function (req, res, next) {
    let ads = [
        {
            _id: '2333444333',
            pic: '/meta/bt01.jpeg',
            title: '全国外围经纪人',
            girls:88,
            wanna:1322
        },
        {
            _id: '2333444333',
            pic: '/meta/bt02.jpeg',
            title: '全国高端外围阳阳',
            girls:96,
            wanna:1238
        },
        {
            _id: '2333444333',
            pic: '/meta/bt03.jpeg',
            title: '全国外围安排',
            girls:368,
            wanna:1980
        },
        {
            _id: '2333444333',
            pic: '/meta/bt04.jpeg',
            title: '全国外围本地通',
            girls:299,
            wanna:899
        },
        {
            _id: '2333444333',
            pic: '/meta/bt05.jpeg',
            title: '黄馆主',
            girls:188,
            wanna:1322
        },
        {
            _id: '2333444333',
            pic: '/meta/bt06.jpeg',
            title: '全国外围经纪人',
            girls:88,
            wanna:1522
        },
        {
            _id: '2333444333',
            pic: '/meta/bt07.jpeg',
            title: '全国外围连锁',
            girls:38,
            wanna:1322
        }
    ];
    res.send(response(true, ads));
});

module.exports = router;
