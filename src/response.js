function responseWithMsg(isSuccess, msg, data = {}) {
    return {
        code: isSuccess ? 0 : -1,
        msg,
        data
    }
}

function response(isSuccess, data = {}) {
    if (isSuccess)
        return responseWithMsg(isSuccess, successInfo, data);
    else
        return responseWithMsg(isSuccess, failInfo, data);
}

const successInfo = "请求成功";
const failInfo = "请求失败";
const paraErr = "参数错误";
const loginErr = "登录失败";
const tokenErr = "token无效";
const bindErr = "已经绑定了账号";
const bindFailErr = "绑定失败";
const accountExitsErr = "账号已存在，请换个账号绑定";
const loginFirstErr = "请先登录";
const neverbindErr = "未绑定账号";
const invaPasswordErr = "密码错误";


module.exports = {
    response,
    responseWithMsg,
    successInfo,
    failInfo,
    paraErr,
    loginErr,
    tokenErr,
    bindErr,
    bindFailErr,
    accountExitsErr,
    loginFirstErr,
    neverbindErr,
    invaPasswordErr
};