import { ErrorHandlingService } from './error-handling.service';
import { SequelizeService } from './sequelize.service';
import { Utility } from '../shared/utility';
import { Logging } from './logging.service';
var configForLogs = require('../../config');
//postgresDataAccess
export class DataAccessService {
    constructor() {
        Logging('Initialize data access service');
    }
    static executeSP(pSPName, pParams, pIsJSONFormat) {
        Logging('Executing sp : ' + pSPName);
        return new Promise(function (pResolve, pReject) {
            try {
                // build stored procedure params
                let vParams;
                // if we pass a JSON as parameter
                // make sure that the created stored procedure accept 1 param with type of JSON
                if (pIsJSONFormat) {
                    vParams = '(\'' + JSON.stringify(pParams) + '\')';
                }
                else {
                    // default params for stored procedure if null object is passed as parameter
                    // converting params object into parameter in stored procedure
                    if (pParams) {
                        vParams = '(';
                        for (let vParam in pParams) {
                            if (pParams[vParam] !== undefined && pParams[vParam] !== null && typeof pParams[vParam] === 'string' && pParams[vParam].indexOf('\'') !== -1) {
                                pParams[vParam] = Utility.replaceAll(pParams[vParam], '\'', '\'\'');
                            }
                            vParams += "'" + pParams[vParam] + "',";
                        }
                        vParams = vParams.substring(0, vParams.lastIndexOf(',')) + ');';
                    }
                    else {
                        vParams = '();';
                    }
                }
                // build query to execute stored procedure
                let vSQL = 'SELECT ' + pSPName + vParams;
                configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQuery' + '' + new Date() }).info({
                    resultMsg: vSQL
                });
                // console.log(vSQL);
                SequelizeService.sequelize.query(vSQL, { type: SequelizeService.sequelize.QueryTypes.SELECT }).then(function (pResult) {
                    // stored procedure will return 0 if there is no errors
                    let vResult = pResult[0][pSPName.toLowerCase()];
                    if (vResult.status === 0) {
                        Logging('Result test : ' + JSON.stringify(vResult));
                        Logging("success : ");
                        Logging(vResult.result);
                        pResolve(vResult.result);
                        configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResult' + '' + new Date() }).info({
                            resultMsg: vResult.result
                        });
                        // functional error occured while execute the stored procedure
                    }
                    else {
                        Logging('Error while executing query : ' + vSQL);
                        Logging('Result : ' + JSON.stringify(vResult));
                        configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResult' + '' + new Date() }).info({
                            resultMsg: JSON.stringify(vResult)
                        });
                        ErrorHandlingService.throwPromiseError(pReject, vResult.error_code, vResult.error_msg);
                    }
                }).catch(function (pErr) {
                    Logging('Error while executing query : ' + vSQL);
                    // throwing error from the sequelize
                    Logging('Error ' + pErr);
                    configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResultError' + '' + new Date() }).error({
                        resultMsg: pErr
                    });
                    ErrorHandlingService.throwPromiseError(pReject, 400, pErr);
                });
            }
            catch (pErr) {
                Logging('Error fron data access server ' + pErr);
                configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResultError' + '' + new Date() }).error({
                    resultMsg: pErr
                });
                ErrorHandlingService.throwPromiseError(pReject, 400, pErr);
            }
        });
    }
    static executeSPWithCallback(pSPName, pParams, pIsJSONFormat, callback) {
        Logging('Executing sp : ' + pSPName);
        try {
            // build stored procedure params
            let vParams;
            // if we pass a JSON as parameter
            // make sure that the created stored procedure accept 1 param with type of JSON
            if (pIsJSONFormat) {
                vParams = '(\'' + JSON.stringify(pParams) + '\')';
            }
            else {
                // default params for stored procedure if null object is passed as parameter
                // converting params object into parameter in stored procedure
                if (pParams) {
                    vParams = '(';
                    for (let vParam in pParams) {
                        if (pParams[vParam] !== undefined && pParams[vParam] !== null && typeof pParams[vParam] === 'string' && pParams[vParam].indexOf('\'') !== -1) {
                            pParams[vParam] = Utility.replaceAll(pParams[vParam], '\'', '\'\'');
                        }
                        vParams += "'" + pParams[vParam] + "',";
                    }
                    vParams = vParams.substring(0, vParams.lastIndexOf(',')) + ');';
                }
                else {
                    vParams = '();';
                }
            }
            // build query to execute stored procedure
            let vSQL = 'SELECT ' + pSPName + vParams;
            configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQuery' + '' + new Date() }).info({
                resultMsg: vSQL
            });
            // console.log(vSQL);
            SequelizeService.sequelize.query(vSQL, { type: SequelizeService.sequelize.QueryTypes.SELECT }).then(function (pResult) {
                // stored procedure will return 0 if there is no errors
                let vResult = pResult[0][pSPName.toLowerCase()];
                if (vResult.status === 0) {
                    Logging("success : ");
                    configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResult' + '' + new Date() }).info({
                        resultMsg: vResult.result
                    });
                    callback(vResult.result);
                    // functional error occured while execute the stored procedure
                }
                else {
                    Logging('Error while executing query : ' + vSQL);
                    Logging('Result : ' + JSON.stringify(vResult));
                    configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResult' + '' + new Date() }).info({
                        resultMsg: JSON.stringify(vResult)
                    });
                    callback("fail");
                }
            }).catch(function (pErr) {
                Logging('Error while executing query : ' + vSQL);
                // throwing error from the sequelize
                Logging('Error ' + pErr);
                configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResultError' + '' + new Date() }).error({
                    resultMsg: pErr
                });
                callback("fail");
            });
        }
        catch (pErr) {
            Logging('Error fron data access server ' + pErr);
            configForLogs.logger.postgresDataAccess.child({ TAG: 'sqlQueryResultError' + '' + new Date() }).error({
                resultMsg: pErr
            });
            callback("fail");
        }
    }
}
