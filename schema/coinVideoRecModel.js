var mongoose = require('mongoose');
var coinVideoRecSchema = require("./coinVideoRecSchema");

var CoinVideoRec = mongoose.model('CoinVideoRec', coinVideoRecSchema);

module.exports = CoinVideoRec;
