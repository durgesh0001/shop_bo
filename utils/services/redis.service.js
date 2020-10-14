import { Logging } from './logging.service';
import { ErrorHandlingService } from './error-handling.service';
var vEnv = require('../../config/server_config/mode.json')['mode'];
const vConfig = require('../../config/server_config/config.json')[vEnv];
var redis = require('ioredis');
var bluebird = require("bluebird");
var vFs = require('fs');
var vToday = Date.now();
var vDate = new Date(vToday);
var configForLogs = require('../../config');
export class RedisService {
    constructor() {
        try {
            Logging("initialize redis service");
            let conf = vConfig.redis.redisConfig;
            conf.retry_unfulfilled_commands = false;
            conf.retry_strategy = function (options) {
                Logging(options.error);
                RedisService.up = false;
                RedisService.errordesc = options.error;
                return Math.max(options.attempt * 100, 3000);
            };
            RedisService.client = bluebird.promisifyAll(redis.createClient(conf));
            RedisService.client.on("error", function (err) {
                configForLogs.logger.redisMydigi.child({ TAG: 'connectionRequestError' + '' + new Date() }).error({
                    resultMsg: err,
                });
                Logging('Error has been occured.');
            });
            RedisService.client.on("reconnecting", function (err) {
                configForLogs.logger.redisMydigi.child({ TAG: 'connectionRequestStatus' + '' + new Date() }).info({
                    resultMsg: 'Reconnecting to redis server.',
                });
                Logging('Reconnecting to redis server.');
            });
            RedisService.client.on("end", function (err) {
                configForLogs.logger.redisMydigi.child({ TAG: 'connectionRequestStatus' + '' + new Date() }).info({
                    resultMsg: 'Redis connection has been closed.',
                });
                Logging('Redis connection has been closed.');
                RedisService.up = false;
            });
            RedisService.client.on("ready", function (err) {
                Logging("Redis is up.");
                configForLogs.logger.redisMydigi.child({ TAG: 'connectionRequestStatus' + '' + new Date() }).info({
                    resultMsg: 'Redis is up.',
                });
                RedisService.up = true;
            });
            RedisService.client.on("connect", function (err) {
                Logging("Redis is connected.");
                configForLogs.logger.redisMydigi.child({ TAG: 'connectionRequestStatus' + '' + new Date() }).info({
                    resultMsg: 'Redis is connected.',
                });
                RedisService.up = true;
            });
        }
        catch (pErr) {
            configForLogs.logger.redisMydigi.child({ TAG: 'connectionRequestError' + '' + new Date() }).error({
                resultMsg: 'Error while establishing database connection with redis : ' + pErr,
            });
            Logging('Error while establishing database connection with redis : ' + pErr);
            throw 401;
        }
    }
    static errorHandling(desc) {
        if (RedisService.up == false) {
            Logging(RedisService.errordesc);
            if (desc == undefined)
                ErrorHandlingService.throwError(703, RedisService.errordesc);
            else
                ErrorHandlingService.throwError(703, desc);
        }
    }
    static async setVal(val, key, time) {
        try {
            RedisService.errorHandling();
            let setResponse = await RedisService.client.setAsync(key, val);
            if (time != undefined && time != "" && time != null) {
                let expireResponse = await RedisService.client.expireAsync(key, time);
            }
            configForLogs.logger.redisMydigi.child({ TAG: 'redisSetValueStatus' + '' + new Date() }).info({
                resultMsg: 'key:' + key + ' data:' + val
            });
            return true;
        }
        catch (pErr) {
            configForLogs.logger.redisMydigi.child({ TAG: 'redisSetValueError' + '' + new Date() }).error({
                resultMsg: 'Error while set data to redis'
            });
            ErrorHandlingService.throwError(703, 'Error while set data to redis');
            return false;
        }
    }
    static async getVal(key) {
        try {
            RedisService.errorHandling();
            //var data = RedisService.timeLimited(RedisService.client.getAsync(key),5500);
            var data = await RedisService.client.getAsync(key);
            configForLogs.logger.redisMydigi.child({ TAG: 'redisGetValueStatus' + '' + new Date() }).info({
                resultMsg: 'key:' + key + ' data:' + data
            });
            return data;
        }
        catch (pErr) {
            Logging(pErr);
            configForLogs.logger.redisMydigi.child({ TAG: 'redisGetValueError' + '' + new Date() }).error({
                resultMsg: 'Error while retrieve data to redis'
            });
            ErrorHandlingService.throwError(703, 'Error while retrieve data to redis');
            return null;
        }
    }
    static async checkExists(val) {
        try {
            RedisService.errorHandling();
            var data = await RedisService.client.existsAsync(val);
            configForLogs.logger.redisMydigi.child({ TAG: 'redisCheckExists' + '' + new Date() }).info({
                resultMsg: 'status  value:' + val + ' data:' + data
            });
            return data;
        }
        catch (pErr) {
            configForLogs.logger.redisMydigi.child({ TAG: 'redisCheckExistsError' + '' + new Date() }).error({
                resultMsg: 'Error while check data to redis'
            });
            ErrorHandlingService.throwError(703, 'Error while check data to redis');
            return null;
        }
    }
    static async delSpecificKey(key) {
        try {
            RedisService.errorHandling();
            configForLogs.logger.redisMydigi.child({ TAG: 'redisdeleteSpecificKey' + '' + new Date() }).info({
                resultMsg: 'Key :' + key
            });
            await RedisService.client.delAsync(key);
        }
        catch (pErr) {
            configForLogs.logger.redisMydigi.child({ TAG: 'redisdeleteSpecificKeyError' + '' + new Date() }).error({
                resultMsg: 'Key :' + key + ' Error :' + pErr
            });
            ErrorHandlingService.throwError(703, 'Error while delete data from redis');
            return null;
        }
    }
    static async delKey(key_msisdn) {
        // Example syntax delKey('6281910110748');
        try {
            RedisService.errorHandling();
            let attributes = vConfig.redis.attributes;
            let delResponse = [];
            for (var i in attributes) {
                delResponse[i] = await RedisService.client.delAsync(key_msisdn + ":" + attributes[i]);
            }
            configForLogs.logger.redisMydigi.child({ TAG: 'redisdeleteKeys' + '' + new Date() }).info({
                resultMsg: 'deleted keys :' + delResponse
            });
            return delResponse;
        }
        catch (pErr) {
            configForLogs.logger.redisMydigi.child({ TAG: 'redisdeleteKeysError' + '' + new Date() }).error({
                resultMsg: 'Error while delete data from redis'
            });
            ErrorHandlingService.throwError(703, 'Error while delete data from redis');
            return null;
        }
    }
}
RedisService.up = false;
RedisService.errordesc = "Error while establishing database connection with redis";
