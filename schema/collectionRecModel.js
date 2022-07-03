var mongoose = require('mongoose');
var collectionRecSchema = require("./collectionRecSchema");

var CollectionRec = mongoose.model('CollectionRec', collectionRecSchema);

module.exports = CollectionRec;
