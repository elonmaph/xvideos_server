const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const { populate } = require('../schema/listModel');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function () {
    this.useCache = true;
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache)
    {
        // console.log('not use cache..');
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(),this.getOptions(), { collection: this.mongooseCollection.name }));
    const cacheValue = await client.get(key);
    if (cacheValue) {
        // console.log('value from cache..');
        const doc = JSON.parse(cacheValue);
        this.doc
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }
    const result = await exec.apply(this, arguments);
    client.set(key, JSON.stringify(result));
    // console.log('value from database..');
    return result;
}