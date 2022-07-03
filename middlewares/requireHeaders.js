const { responseWithMsg, paraErr } = require('../src/response');

module.exports = (req, res, next) => {
    const { device_id, platform, api_version } = req.headers;
    if (!device_id || device_id === 'undefined'
        || !platform || platform === 'undefined'
        || !api_version || api_version === 'undefined') {
        return res.status(401).send(responseWithMsg(false, paraErr));
    }
    next();
};
