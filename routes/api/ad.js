var express = require('express');
var router = express.Router();

const { response } = require('../../src/response');

/* 获取视频详情页面的广告*/
router.get('/videoDetail', async function (req, res, next) {
    let ads = [
        {
            _id: '2333444333',
            pic: '/meta/video_b_01.jpg',
            link: 'https://yn4.cc/?channelCode=yn4',
        }
    ];
    res.send(response(true, ads));
});

/* 获取大banner广告*/
router.get('/banner', async function (req, res, next) {
    let ads = [
        {
            _id: '2333444333',
            pic: '/meta/ad_b_01.jpg',
            link: 'https://yn4.cc/?channelCode=yn4',
        }
    ];
    res.send(response(true, ads));
});

/* 获取大banner广告*/
router.get('/splash', async function (req, res, next) {
    let ads = {
        _id: '2333444333',
        pic: '/meta/splash_ad.jpg',
        link: 'https://yn4.cc/?channelCode=yn4',
    };
    res.send(response(true, ads));
});

module.exports = router;
