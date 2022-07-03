var express = require('express');
var router = express.Router();
var Video = require('../../schema/videoModel');
var ObjectID = require('mongodb').ObjectID;
const { response } = require('../../src/response');
require('../../src/cache');

/**
 * 游标函数
 * @param _start 游标的起始位置
 * @param _limit 游标的分页数量
 * @param _callback 游标执行函数
 */
async function cursor(_start, _limit, _callback) {
    //初始化数据定义
    let start, limit;
    //初始化起始位置
    start = !_start || _start < 0 ? 0 : _start;
    //初始化分页数量
    limit = !_limit || _limit < 1 ? 1 : _limit;

    //使用Model执行分页查询
    let docs = await Video.find({}, 'title duration preview screenshot_thumb screenshot models uri', { skip: start, limit: limit });
    if (_callback) {
        _callback(docs);
    }
}

async function cursorByCategory(_start, _limit, _category, _callback) {
    //初始化数据定义
    let start, limit;
    //初始化起始位置
    start = !_start || _start < 0 ? 0 : _start;
    //初始化分页数量
    limit = !_limit || _limit < 1 ? 1 : _limit;

    //使用Model执行分页查询
    let docs = await Video.find({ categories: { $all: [_category] } }, 'title duration preview screenshot_thumb uri', { skip: start, limit: limit });
    if (_callback) {
        _callback(docs);
    }
}

async function cursorByTag(_start, _limit, _tag, _callback) {
    //初始化数据定义
    let start, limit;
    //初始化起始位置
    start = !_start || _start < 0 ? 0 : _start;
    //初始化分页数量
    limit = !_limit || _limit < 1 ? 1 : _limit;

    //使用Model执行分页查询
    let docs = await Video.find({ tags: { $all: [_tag] } }, 'title duration preview screenshot_thumb uri', { skip: start, limit: limit });
    if (_callback) {
        _callback(docs);
    }
}

async function cursorByKey(_start, _limit, _key, _callback) {
    //初始化数据定义
    let start, limit;
    //初始化起始位置
    start = !_start || _start < 0 ? 0 : _start;
    //初始化分页数量
    limit = !_limit || _limit < 1 ? 1 : _limit;

    //使用Model执行分页查询
    let docs = await Video.find({
        $or: [
            { title: { $regex: _key } },
            { categories: { $regex: _key } },
            { tags: { $regex: _key } },
            { models: { $regex: _key } },
        ]
    },
        { __v: 0 },
        { skip: start, limit: limit });
    if (_callback) {
        _callback(docs);
    }
}

async function cursorByAuthor(_start, _limit, author, type) {
    //初始化数据定义
    let start, limit;
    //初始化起始位置
    start = !_start || _start < 0 ? 0 : _start;
    //初始化分页数量
    limit = !_limit || _limit < 1 ? 1 : _limit;

    if (type == -1) {
        //使用Model执行分页查询
        let docs = await Video.find({ "author._id": author, status: 1 }, { __v: 0 }, { sort: { _id: -1 }, skip: start, limit: limit }).cache();
        return docs;
    }
    else {
        //使用Model执行分页查询
        let docs = await Video.find({ "author._id": author, type: type, status: 1 }, { __v: 0 }, { sort: { _id: -1 }, skip: start, limit: limit }).cache();
        return docs;
    }

}

/* Get latest videos. */
router.get('/', function (req, res, next) {
    let { index, size } = req.query;
    cursor(parseInt(index), parseInt(size), function (videos) {
        res.send({ code: 0, msg: 'sucess', data: videos });
    });
});

/* Get videos by category. */
router.get('/category', function (req, res, next) {
    let { index, size, category } = req.query;
    cursorByCategory(parseInt(index), parseInt(size), category, function (videos) {
        res.send({ code: 0, msg: 'sucess', data: videos });
    });
});

/* Get videos by category. */
router.get('/tag', function (req, res, next) {
    let { index, size, tag } = req.query;
    cursorByTag(parseInt(index), parseInt(size), tag, function (videos) {
        res.send({ code: 0, msg: 'sucess', data: videos });
    });
});

/* Get videos by key search. */
router.get('/search', async function (req, res, next) {
    let { index, size, key, type } = req.query;
    const reg = new RegExp(key + '.*?', 'i')
    // cursorByKey(parseInt(index), parseInt(size), reg, function (videos) {
    //     res.send({ code: 0, msg: 'sucess', data: videos });
    // });

    if (type == -1) {
        let docs = await Video.find({
            $or: [
                { title: { $regex: reg } },
                { categories: { $regex: reg } },
                { tags: { $regex: reg } },
                { models: { $regex: reg } },
            ],
        },
            { __v: 0 },
            { skip: parseInt(index), limit: parseInt(size) });
        res.send(response(true, docs));
    }
    else {
        let docs = await Video.find({
            $or: [
                { title: { $regex: reg } },
                { categories: { $regex: reg } },
                { tags: { $regex: reg } },
                { models: { $regex: reg } },
            ],
            type
        },
            { __v: 0 },
            { skip: parseInt(index), limit: parseInt(size) });
        res.send(response(true, docs));
    }
});

/* Get videos by author. */
router.get('/author', async function (req, res, next) {
    let { index, size, author, type } = req.query;
    let videos = await cursorByAuthor(parseInt(index), parseInt(size), author, parseInt(type));
    res.send(response(true, videos));
});

/* Get videos by list. */
router.get('/list', async function (req, res, next) {
    let { index, size, list, type } = req.query;
    let videos = [];
    if (parseInt(type) == -1) {
        videos = await Video.find({ list: { $all: [list] }, status: 1 }, { __v: 0 }, { skip: parseInt(index), limit: parseInt(size) }).cache();
    }
    else {
        videos = await Video.find({ list: { $all: [list] }, type, status: 1 }, { __v: 0 }, { skip: parseInt(index), limit: parseInt(size) }).cache();
    }
    res.send(response(true, videos));
});

module.exports = router;
