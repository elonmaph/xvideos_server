var mongoose = require('mongoose');
var followRecSchema = require("./followRecSchema");

var FollowRec = mongoose.model('FollowRec', followRecSchema);

module.exports = FollowRec;
