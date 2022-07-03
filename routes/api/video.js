var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var shell = require('shelljs')
var ObjectID = require('mongodb').ObjectID;

var User = require('../../schema/userModel');
var Video = require('../../schema/videoModel');
var CollectionRec = require('../../schema/collectionRecModel');
var CoinVideoRec = require('../../schema/coinVideoRecModel');
const { response, responseWithMsg } = require('../../src/response');

/* GET video detail. */
router.get('/', async function (req, res, next) {
    let { _id } = req.query;
    if (_id) {
        var sid = mongoose.Types.ObjectId(_id);
        let video = await Video.findOne({ _id: sid });

        startspider = `scrapy crawl video -a start_urls=${video.uri} -a _id=${_id}`
        shell.cd('..');
        shell.cd('xvideos_spider');
        shell.exec(startspider, async function (code, stdout, stderr) {
            console.log('Exit code:', code);
            console.log('Program output:', stdout);
            console.log('Program stderr:', stderr);
            let video = await Video.findOne({ _id: sid });
            res.send({ code: 0, msg: 'success', data: video });
        });
    }
    else {
        res.status(201).send({ code: -1, msg: '_id is required parameters' });
    }
});

/*收藏和取消收藏*/
router.patch('/collection', async function (req, res, next) {
    let { collect, video } = req.body;
    if (JSON.parse(collect)) {
        let rec = await CollectionRec.findOne({ user: ObjectID(req.user.user_id), video: ObjectID(video) });
        if (rec) {
            res.send(response(true));
        }
        else {
            let videoObj = await Video.findOne({_id:ObjectID(video)},{type:1});

            let record = CollectionRec({
                user: ObjectID(req.user.user_id),
                video: ObjectID(video),
                type: videoObj.type,
            });
            await record.save();
            res.send(response(true));
        }
    }
    else {
        await CollectionRec.deleteOne({ user: ObjectID(req.user.user_id), video: ObjectID(video) })
        res.send(response(true));
    }
});

/*查询是否收藏某个作品*/
router.get('/isCollect', async function (req, res, next) {
    let { video } = req.query;
    let rec = await CollectionRec.findOne({ user: ObjectID(req.user.user_id), video: ObjectID(video) });
    if (rec) {
        res.send(response(true, { isCollect: true }));
    }
    else {
        res.send(response(true, { isCollect: false }));
    }
});

/*查询作品收藏数*/
router.get('/collectCnt', async function (req, res, next) {
    let { video } = req.query;
    let rec = await CollectionRec.find({ video: ObjectID(video) }).countDocuments();
    res.send(response(true, { collectCnt: rec }));
});

/*购买视频*/
router.post('/buy', async function (req, res, next) {
    let { video_id } = req.body;
    let user = await User.findOne({_id:ObjectID(req.user.user_id)},{coins:1,vip:1});
    let video = await Video.findOne({_id:ObjectID(video_id)},{coin:1, type:1});
    let price = 0;
    if (user.vip > 0)
    {
        price = Math.ceil(video.coin*0.8);
    }
    else
    {
        price = video.coin;
    }

    if (user.coins >= price)
    {
        let needCoin = parseInt(price);
        await User.findByIdAndUpdate(req.user.user_id,{$inc:{ coins: -needCoin }})
        let rec = new CoinVideoRec({
            user: ObjectID(req.user.user_id),
            video: ObjectID(video_id),
            type: video.type,
        });
        res.send(response(true, await rec.save()));
    }
    else
    {
        res.send(responseWithMsg(false, '钻石不足'));
    }
});

/*购买视频*/
router.get('/isBuy', async function (req, res, next) {
    let { video } = req.query;
    let rec = await CoinVideoRec.findOne({ video: ObjectID(video), user: ObjectID(req.user.user_id) });
    if (rec) {
        res.send(response(true, { isBuy: true }));
    }
    else {
        res.send(response(true, { isBuy: false }));
    }
});

module.exports = router;
