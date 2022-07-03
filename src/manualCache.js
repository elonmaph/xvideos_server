const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

function manualCache(key,value){
    client.set(key, value);
}

async function manualGetCache(key)
{
    const cacheValue = await client.get(key);
    if (cacheValue)
    {
        return cacheValue;
    }
    else
    {
        return null;
    }
}

module.exports = {
    manualCache,
    manualGetCache,
}



