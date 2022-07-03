var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('express-jwt');

const requireHeaders = require('./middlewares/requireHeaders');

require('dotenv').config({ path: '.env' });

var connectDB = require('./src/connectdb');

/*apis*/
var indexRouter = require('./routes/index');
var userRouter = require('./routes/api/user');
var videoRouter = require('./routes/api/video');
var videosRouter = require('./routes/api/videos');
var categoryRouter = require('./routes/api/category');
var sectionRouter = require('./routes/api/section');
var rechargeRouter = require('./routes/api/recharge');
var adRouter = require('./routes/api/ad');
var listRouter = require('./routes/api/list');
var dateRouter = require('./routes/api/date');
var orderRouter = require('./routes/api/order');
var productRouter = require('./routes/api/product');
var metaRouter = require('./routes/api/meta');

const { responseWithMsg, tokenErr } = require('./src/response');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(requireHeaders);

app.use(jwt({
    secret: process.env.jwt_secret,
    algorithms: [process.env.jwt_algorithm],
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.token) {
            return req.headers.token;
        }
        return null;
    }
}).unless({ path: ['/api/user/deviceSignin', '/api/order/server','/api/meta', '/api/order/page'] }));

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send(responseWithMsg(false, tokenErr));
    }
});

/*apis*/
app.use('/', indexRouter);
app.use('/api/user', userRouter);
app.use('/api/video', videoRouter);
app.use('/api/videos', videosRouter);
app.use('/api/category', categoryRouter);
app.use('/api/section', sectionRouter);
app.use('/api/recharge', rechargeRouter);
app.use('/api/ad', adRouter);
app.use('/api/list', listRouter);
app.use('/api/date', dateRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/meta', metaRouter);

connectDB();

module.exports = app;
