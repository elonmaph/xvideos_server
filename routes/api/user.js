var express = require('express');
var router = express.Router();
const User = require('../../schema/userModel');
const Video = require('../../schema/videoModel');
const FollowRec = require('../../schema/followRecModel');
const CollectionRec = require('../../schema/collectionRecModel');
const CoinVideoRecModel = require('../../schema/coinVideoRecModel');
const SigninRec = require('../../schema/signinRecModel');

var mongoose = require('mongoose');
const { response, responseWithMsg, loginErr, bindErr, bindFailErr, accountExitsErr, neverbindErr, invaPasswordErr } = require('../../src/response');
const jwt = require('jsonwebtoken');
const faker = require('faker/locale/zh_CN');
const crypto = require('crypto');
var ObjectID = require('mongodb').ObjectID;
const { nanoid } = require('nanoid')

function md5(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

/*
游客登录
*/
router.post('/deviceSignin', async function (req, res, next) {
  const { device_id, platform } = req.headers;
  let { invite_id } = req.body;
  if (invite_id == undefined || invite_id == '' || invite_id == null) {
    invite_id = 'default';
  }
  var user = await User.findOne({ device_id }, { __v: 0 });
  if (user) {
    const token = jwt.sign({ user_id: user._id }, process.env.jwt_secret);

    user._doc.token = token;
    let signinRec = new SigninRec({
      user:user._id.toString(),
      type:1,
      create_time:Math.floor(Date.now() / 1000)
    });
    await signinRec.save();
    res.send(response(true, user));
  }
  else {
    const user = new User({
      device_id,
      nickname: faker.name.findName(),
      avatar: faker.image.avatar(),
      invite_by: invite_id,
      platform,
      platform_id:nanoid(8),
      create_time:Math.floor(Date.now() / 1000)
    });
    try {
      await user.save();
      const token = jwt.sign({ user_id: user._id }, process.env.jwt_secret);
      user._doc.token = token;
      if (invite_id != 'default') {
        let inviter = await User.findOneAndUpdate({ platform_id: invite_id }, { $inc: { inviters: 1 } })
        let vip_ex = inviter.vip_ex;
        if (vip_ex == 0) {
          vip_ex = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;
        }
        else {
          vip_ex += 3 * 24 * 60 * 60;
        }
        await User.findOneAndUpdate({ platform_id: invite_id }, { $set: { vip: 1, vip_ex: parseInt(vip_ex), vip_tag: '临时' } });
      }

      let signinRec = new SigninRec({
        user:user._id.toString(),
        type:0,
        create_time:Math.floor(Date.now() / 1000)
      });
      await signinRec.save();

      res.send(response(true, user));
    } catch (err) {
      res.send(responseWithMsg(false, loginErr));
    }
  }
});

/*
账号登录
*/
router.post('/signin', async function (req, res, next) {
  const { username, password } = req.body;

  var user = await User.findOne({ username }, { __v: 0 });
  if (user) {
    const validPassword = user.validPassword(password);
    if (validPassword) {
      try {
        await User.updateOne({ username }, { $set: { device_id: req.headers.device_id } });
        try {
          await User.findByIdAndDelete(req.user.user_id);
          const token = jwt.sign({ user_id: user._id }, process.env.jwt_secret);
          user._doc.token = token;
          res.send(response(true, user));
        } catch (error) {
          res.send(responseWithMsg(false, loginErr));
        }
      } catch (error) {
        res.send(responseWithMsg(false, loginErr));
      }
    }
    else {
      res.send(responseWithMsg(false, loginErr));
    }
  }
  else {
    res.send(responseWithMsg(false, loginErr));
  }
});

/* 获取用户信息 */
router.get('/', async function (req, res, next) {
  var user = await User.findById(req.user.user_id, { __v: 0 });
  if (user) {
    res.send(response(true, user));
  }
  else {
    res.send(response(false));
  }
});

/*
绑定手机
*/
router.post('/bindPhone', function (req, res, next) {
  res.send('respond with a resource');
});

/*
是否绑定手机
*/
router.get('/bindPhone', function (req, res, next) {
  res.send('respond with a resource');
});

/*
绑定账号
*/
router.post('/bind', async function (req, res, next) {
  const { username, password } = req.body;
  var user = await User.findById(req.user.user_id, { username: 1 });
  if (user.username) {
    res.send(responseWithMsg(false, bindErr));
  }
  else {
    var exitUser = await User.findOne({ username }, { username: 1 });
    if (exitUser && exitUser.username) {
      res.send(responseWithMsg(false, accountExitsErr));
    }
    else {
      try {
        await User.findByIdAndUpdate(req.user.user_id, { username, password: md5(password) });
        res.send(response(true));
      } catch (err) {
        res.send(responseWithMsg(false, bindFailErr));
      }
    }
  }
});

/*
获取是否绑定账号
*/
router.get('/bind', async function (req, res, next) {
  var user = await User.findById(req.user.user_id, { username: 1 });
  if (user.username) {
    res.send(response(true, { isBindedAccout: true, username: user.username }));
  }
  else {
    res.send(response(true, { isBindedAccout: false }));
  }
});


/*
修改密码
*/
router.post('/password', async function (req, res, next) {
  const { org_password, password } = req.body;
  var user = await User.findById(req.user.user_id, { username: 1, password: 1 });
  if (user.username) {
    if (user.validPassword(org_password)) {
      try {
        await User.findByIdAndUpdate(req.user.user_id, { password: md5(password) });
        res.send(response(true));
      } catch (error) {
        res.send(response(false));
      }
    }
    else {
      res.send(responseWithMsg(false, invaPasswordErr));
    }
  }
  else {
    res.send(responseWithMsg(false, neverbindErr));
  }
});

/*
获取身份备份信息
*/
router.get('/backup', function (req, res, next) {
  res.send('respond with a resource');
});

/*
绑定备份信息
*/
router.get('/bindBackup', function (req, res, next) {
  res.send('respond with a resource');
});

/**
 * 游标函数
 * @param _start 游标的起始位置
 * @param _limit 游标的分页数量
 * @param _callback 游标执行函数
 */
async function cursorByType(_start, _limit, _type, _id, _callback) {
  //初始化数据定义
  let start, limit, type;
  //初始化起始位置
  start = !_start || _start < 0 ? 0 : _start;
  //初始化分页数量
  limit = !_limit || _limit < 1 ? 1 : _limit;
  type = _type;

  //使用Model执行分页查询
  let query = { author: ObjectID(_id), status: 1 }
  if (type != -1) {
    query = { type, author: ObjectID(_id), status: 1 }
  }
  let docs = await Video.find(query, { __v: 0 }, { skip: start, limit: limit });
  if (_callback) {
    _callback(docs);
  }
}

/*获取本人所有视频*/
router.get('/videos', function (req, res, next) {
  let { index, size, type } = req.query;
  cursorByType(parseInt(index), parseInt(size), parseInt(type), req.user.user_id, function (videos) {
    res.send(response(true, videos));
  });
});

/*查询是否关注某个作者*/
router.get('/isFollow', async function (req, res, next) {
  let { user_id } = req.query;
  let rec = await FollowRec.findOne({ follower: ObjectID(req.user.user_id), target: ObjectID(user_id) });
  if (rec) {
    res.send(response(true, { isFollow: true }));
  }
  else {
    res.send(response(true, { isFollow: false }));
  }
});

/*关注和取消关注*/
router.patch('/follow', async function (req, res, next) {
  let { follow, user_id } = req.body;
  if (JSON.parse(follow)) {
    // console.log(req.user.user_id);
    await User.findByIdAndUpdate(req.user.user_id, { $inc: { following: 1 } });
    let rec = await FollowRec.findOne({ follower: ObjectID(req.user.user_id), target: ObjectID(user_id) });
    if (rec) {
      res.send(response(true));
    }
    else {
      let record = FollowRec({
        follower: ObjectID(req.user.user_id),
        target: ObjectID(user_id)
      });
      await record.save();
      res.send(response(true));
    }
  }
  else {
    await User.findByIdAndUpdate(req.user.user_id, { $inc: { following: -1 } });
    await FollowRec.deleteOne({ follower: ObjectID(req.user.user_id), target: ObjectID(user_id) })
    res.send(response(true));
  }
});

/*查询个人主页信息*/
router.get('/profile', async function (req, res, next) {
  let { user_id } = req.query;
  let user = await User.findById(user_id);
  let videoCnt = await Video.find({ "author._id": user._id, status: 1 }).countDocuments();
  user._doc.videoCnt = videoCnt;
  res.send(response(true, user));
});

/*查询收藏的视频*/
router.get('/collectVideos', async function (req, res, next) {
  let { index, size, type } = req.query;
  let records = [];
  if (parseInt(type) == -1) {
    records = await CollectionRec.find({ user: ObjectID(req.user.user_id) }, { __v: 0 }, { skip: parseInt(index), limit: parseInt(size) });
  }
  else {
    records = await CollectionRec.find({ user: ObjectID(req.user.user_id), type }, { __v: 0 }, { skip: parseInt(index), limit: parseInt(size) });
  }
  let resp = [];
  for (let i = 0; i < records.length; i++) {
    let video_id = records[i].video;
    let video = await Video.findOne({ _id: video_id }, { __v: 0 });
    resp.push(video);
  }
  res.send(response(true, resp));
});

/*查询已解锁的视频*/
router.get('/unlockVideos', async function (req, res, next) {
  let { index, size, type } = req.query;
  let records = [];
  if (parseInt(type) == -1) {
    records = await CoinVideoRecModel.find({ user: ObjectID(req.user.user_id) }, { __v: 0 }, { skip: parseInt(index), limit: parseInt(size) });
  }
  else {
    records = await CoinVideoRecModel.find({ user: ObjectID(req.user.user_id), type }, { __v: 0 }, { skip: parseInt(index), limit: parseInt(size) });
  }
  let resp = [];
  for (let i = 0; i < records.length; i++) {
    let video_id = records[i].video;
    let video = await Video.findOne({ _id: video_id }, { __v: 0 });
    resp.push(video);
  }
  res.send(response(true, resp));
});

router.post('/vipcode', async function (req, res, next) {
  res.send(response(true, { success: false }));
});

module.exports = router;
