import { DataAccessService } from './data-access.service';
var vEnv = require('../../config/server_config/mode.json')['mode'];
const enableLogging = require('../../config/server_config/config.json')[vEnv]['debug'];
var ErrorConfig = require('../../config/server_config/error.json');
var fs = require('fs');
var moment = require('moment');
export function Logging(msg) {
    if (enableLogging) {
        var time = moment().format('DD-MMM-YYYY, hh:mm:ss.SSS a');
        console.log(`${time} | ${msg}`);
    }
}
export class WLog {
    constructor() {
        this.winston = require('winston');
        Logging('initialize winston logger');
        WLog.logger = new (this.winston.Logger)({
            levels: {
                'error': 0,
                'info': 1,
                'debug': 2
            },
            transports: [
                new (this.winston.transports.File)({
                    filename: 'useractivities.log',
                    json: false,
                    level: 'debug',
                    timestamp: function () {
                        let nd = new Date();
                        // YYYYMMDDHHMMSS
                        return nd.getFullYear() + ("0" + (nd.getMonth() + 1)).slice(-2) + ("0" + nd.getDate()).slice(-2) + ':' +
                            ("0" + nd.getHours()).slice(-2) + ':' + ("0" + nd.getMinutes()).slice(-2) + ':' + ("0" + nd.getSeconds()).slice(-2);
                    },
                    formatter: function (options) {
                        // Return string will be passed to logger.
                        let exists = true;
                        try {
                            var vPath = require('path');
                            var log = vPath.join(__dirname, '..', 'useractivities.log');
                            fs.statSync(log);
                        }
                        catch (pErr) {
                            exists = false;
                        }
                        var format = options.timestamp() + '|' + options.level.toUpperCase() + '|' + (undefined !== options.message ? options.message : '') +
                            (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
                        // if(!exists){
                        //     return 'DATE|LEVEL|AREA|INFORMATION|CUSTOMER_ID|MSISDN|NAME|ACCOUNT_CODE|BRN|CORPORATE_ID|CORPORATE_NAME|BILLING_PERIODE\r\n'+format;
                        // }
                        // else
                        return format;
                    }
                })
            ]
        });
        WLog.elogger = new (this.winston.Logger)({
            levels: {
                'error': 0,
                'info': 1,
                'debug': 2
            },
            transports: [
                new (this.winston.transports.File)({
                    filename: 'error.log',
                    json: false,
                    level: 'debug',
                    timestamp: function () {
                        let nd = new Date();
                        // YYYYMMDDHHMMSS
                        return nd.getFullYear() + ("0" + (nd.getMonth() + 1)).slice(-2) + ("0" + nd.getDate()).slice(-2) + ':' +
                            ("0" + nd.getHours()).slice(-2) + ':' + ("0" + nd.getMinutes()).slice(-2) + ':' + ("0" + nd.getSeconds()).slice(-2);
                    },
                    formatter: function (options) {
                        // Return string will be passed to logger.
                        return options.timestamp() + '|' + options.level.toUpperCase() + '|' + (undefined !== options.message ? options.message : '') + '|' +
                            (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
                    }
                })
            ]
        });
    }
    //YYYYMMDDHHMMSS|LEVEL|AREA|INFORMATION|COSTUMER_ID|MSISDN|NAME|ACCOUNT_CODE|ACCOUNT_TYPE|BRN|CORPORATE_ID|CORPORATE_NAME|BILLING_PERIODE|
    //YYYYMMDDHHMMSS|LEVEL|AREA|COSTUMER_ID|MSISDN|CONTEXT_PARAMS|ERROR_CODE|ERROR_MESSAGE|
    static writeErrorToDB(custId, Msisdn, jsonP, area, code, desc) {
        if (ErrorConfig[code])
            desc = ErrorConfig[code];
        WLog.elogger.error('%s|%s|%s|%s|%s|%s', (area == null ? "NULL" : area), (custId == null ? "NULL" : custId), (Msisdn == null ? "NULL" : Msisdn), (jsonP == null ? "NULL" : jsonP), (code == null ? "NULL" : code), (desc == null ? "NULL" : desc));
        let vData = {
            'pCustId': custId,
            'pMsisdn': Msisdn,
            'pContextParams': jsonP,
            'pLoggingArea': area,
            'pErrCode': code,
            'pErrMsg': (desc || '').toString().replace(/'/g, '\'\'').replace(/"/g, '\\\"')
        };
        DataAccessService.executeSP('insert_error_handling', vData, true);
    }
}
