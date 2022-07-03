var mongoose = require('mongoose');
const { Schema } = mongoose;

var followRecSchema = mongoose.Schema(
    {
        target: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        follower: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        create_time: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = followRecSchema;
