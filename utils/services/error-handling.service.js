var ErrorConfig = require('../../config/server_config/error.json');
var vEnv = require('../../config/server_config/mode.json')['mode'];
var config = require('../../config/server_config/config.json')[vEnv];
export class ErrorHandlingService {
    static buildErrorObject(errorCode, errorDescription, inputError) {
        // build error object
        // get error message in the config file if error description exists
        // if not, just use the passed errorDescription parameter
        if (ErrorConfig[errorCode]) {
            errorDescription = ErrorConfig[errorCode];
        }
        let Error = {
            code: errorCode,
            desc: errorDescription,
            inputError: inputError
        };
        // if input errors (errors generated from class validator that is used in model) is passed
        if (!inputError) {
            delete Error.inputError;
        }
        return Error;
    }
    static throwPromiseError(RejectFunction, errorCode, errorDescription, inputError) {
        RejectFunction(ErrorHandlingService.buildErrorObject(errorCode, errorDescription, inputError));
    }
    static throwError(errorCode, errorDescription, inputError) {
        throw ErrorHandlingService.buildErrorObject(errorCode, errorDescription, inputError);
    }
    static throwHTTPErrorResponse(HTTPResponseObject, HTTPResponseStatus, errorCode, errorDescription, inputError) {
        /**************************************************/
        /* HTTPResponseStatus Possible value :            */
        /* 	 -- 400: System Error / Technical Error       */
        /*   -- 500: Non System Error / Functional Error  */
        /**************************************************/
        HTTPResponseObject.status(HTTPResponseStatus).json(ErrorHandlingService.buildErrorObject(errorCode, errorDescription, inputError));
    }
    static throwHTTPErrorResponseNoEncrypt(HTTPResponseObject, HTTPResponseStatus, errorCode, errorDescription, inputError) {
        /**************************************************/
        /* HTTPResponseStatus Possible value :            */
        /* 	 -- 400: System Error / Technical Error       */
        /*   -- 500: Non System Error / Functional Error  */
        /**************************************************/
        if (config.encryption)
            HTTPResponseObject.status(HTTPResponseStatus).oldJson(ErrorHandlingService.buildErrorObject(errorCode, errorDescription, inputError));
        else
            HTTPResponseObject.status(HTTPResponseStatus).json(ErrorHandlingService.buildErrorObject(errorCode, errorDescription, inputError));
    }
}
