var express = require('express');
var router = express.Router();
var Category = require('../../schema/categoryModel');
var Section = require('../../schema/sectionModel');
var Video = require('../../schema/videoModel');
var ObjectID = require('mongodb').ObjectID;
require('../../src/cache');
var { manualCache, manualGetCache } = require('../../src/manualCache');

const { response } = require('../../src/response');

/* 获取分类列表*/
router.get('/', async function (req, res, next) {
    const { position } = req.query;
    var categories = await Category.find({ position }, { __v: 0 }).cache();
    if (categories) {
        res.send(response(true, categories));
    }
    else {
        res.send(response(false, []));
    }
});

/*获取分类下的视频*/
router.get('/videos', async function (req, res, next) {
    const { category_id } = req.query;

    var sections = await Section.find({ _category: ObjectID(category_id), status: 1 }, { __v: 0 }).cache();
    if (sections) {
        for (let i = 0; i < sections.length; i++) {
            let section = sections[i];
            let { type, _id, author, list } = section;
            //0-绑定作者 仅展示短视频 
            //1-绑定作者 仅展示长视频 footer
            //2-绑定作者 仅展示长视频五宫格  footer
            //3-绑定作者 仅展示长视频 横向滚动
            //4-绑定视频分类 仅展示短视频
            //5-绑定视频分类 仅展示长视频 footer
            //6-绑定视频分类 仅展示长视频五宫格  footer
            //7-绑定视频分类 仅展示长视频 横向滚动
            if (type == 0) {
                let videos = await Video.find({ "author._id": author, type: 0, status: 1 }, { __v: 0 }, { skip: 0, limit: 10 }).cache();
                section._doc.videos = videos;
            }
            else if (type == 1) {
                let videos = await Video.find({ "author._id": author, type: 1, status: 1 }, { __v: 0 }, { skip: 0, limit: 6 }).cache();
                section._doc.videos = videos;
            }
            else if (type == 2) {
                let videos = await Video.find({ "author._id": author, type: 1, status: 1 }, { __v: 0 }, { skip: 0, limit: 5 }).cache();
                section._doc.videos = videos;
            }
            else if (type == 3) {
                let videos = await Video.find({ "author._id": author, type: 1, status: 1 }, { __v: 0 }, { skip: 0, limit: 6 }).cache();
                section._doc.videos = videos;
            }
            else if (type == 4) {
                let videos = await Video.find({ list: { $all: [list.toString()] }, type: 0, status: 1 }, { __v: 0 }, { skip: 0, limit: 6 }).cache();
                section._doc.videos = videos;
            }
            else if (type == 5) {
                let videos = await Video.find({ list: { $all: [list.toString()] }, type: 1, status: 1 }, { __v: 0 }, { skip: 0, limit: 6 }).cache();
                section._doc.videos = videos;
            }
            else if (type == 6) {
                let videos = await Video.find({ list: { $all: [list.toString()] }, type: 1, status: 1 }, { __v: 0 }, { skip: 0, limit: 5 }).cache();
                section._doc.videos = videos;
            }
            else if (type == 7) {
                let videos = await Video.find({ list: { $all: [list.toString()] }, type: 1, status: 1 }, { __v: 0 }, { skip: 0, limit: 6 }).cache();
                section._doc.videos = videos;
            }
        }
        res.send(response(true, sections));
    }
    else {
        res.send(response(false, []));
    }
});

module.exports = router;
