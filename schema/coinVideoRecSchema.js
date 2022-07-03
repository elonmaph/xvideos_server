var mongoose = require('mongoose');
const { Schema } = mongoose;

var coinVideoRecSchema = mongoose.Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        },
        type:{
            type:Number
        },
        create_time: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = coinVideoRecSchema;
