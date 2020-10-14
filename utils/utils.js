var utils = require(__base + 'utils');

exports.encrypt = function (req, res) {
    res.send(utils.aesEncryption(req.query.id, 'ccn', 'encryptKey'));
}

exports.decrypt = function (req, res) {
    res.send(utils.aesDecryption(req.query.id, 'ccn', 'encryptKey', false));
}