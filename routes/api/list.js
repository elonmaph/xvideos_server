var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
const List = require('../../schema/listModel');
const { response } = require('../../src/response');

/* 获取视频表单信息 */
router.get('/', async function (req, res, next) {
    const { list_id } = req.query;
    let list = await List.findOne({ _id:ObjectID(list_id) }, { __v: 0 });
    if (list) {
        res.send(response(true, list));
    }
    else {
        res.send(response(false, {}));
    }
});

module.exports = router;