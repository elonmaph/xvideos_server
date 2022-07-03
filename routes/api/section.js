var express = require('express');
var router = express.Router();
var Video = require('../../schema/videoModel');
var Section = require('../../schema/sectionModel');

const { response } = require('../../src/response');

async function cursorBySection(_start, _limit, _id, _callback) {
    //初始化数据定义
    let start, limit;
    //初始化起始位置
    start = !_start || _start < 0 ? 0 : _start;
    //初始化分页数量
    limit = !_limit || _limit < 1 ? 1 : _limit;

    //使用Model执行分页查询
    let docs = await Video.find({ section: { $all: [_id] }, status: 1 }, { __v: 0 }, { skip: start, limit: limit });
    if (_callback) {
        _callback(docs);
    }
}

async function cursorByAuthor(_start, _limit, _author, _callback) {
    //初始化数据定义
    let start, limit;
    //初始化起始位置
    start = !_start || _start < 0 ? 0 : _start;
    //初始化分页数量
    limit = !_limit || _limit < 1 ? 1 : _limit;

    //使用Model执行分页查询
    let docs = await Video.find({ author: _author, status: 1 }, { __v: 0 }, { skip: start, limit: limit });
    if (_callback) {
        _callback(docs);
    }
}

/*获取分区下的视频*/
router.get('/videos', async function (req, res, next) {
    const { section_id, index, size } = req.query;
    let section = await Section.findById(section_id);
    if (section) {
        let { type, author } = section;
        if (type == 0) {
            cursorBySection(parseInt(index), parseInt(size), section_id, function (videos) {
                res.send(response(true, videos));
            });
        }
        else {
            cursorByAuthor(parseInt(index), parseInt(size), author, function (videos) {
                res.send(response(true, videos));
            });
        }
    }
    else {
        res.send(response(false));
    }
});

module.exports = router;
