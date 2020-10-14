import { ErrorHandlingService } from "../../utils/services/error-handling.service";
import { Logging } from "../../utils/services/logging.service";
import { DataAccessService } from "../../utils/services/data-access.service";
var vEnv = require("../../config/server_config/mode.json")["mode"];
var encryption_service_1 = require("../../utils/services/encryption.service");
var encyption = new encryption_service_1.EncryptionService();

import { Token } from "../../utils/services/token.service";

export class loginController {
    constructor() {
        Logging("initialize login controller");
        loginController.tokenService = new Token();
    }

    async login(pRequest, pResponse) {
        if(pRequest.body.email && pRequest.body.password) {
            let password = pRequest.body.password;
            password = encyption.getEncryptedPassword(password.trim());
            let vParams = {
                'puseremail': pRequest.body.email,
                'ppassword': password,
            }
            let responseUser = await DataAccessService.executeSP('validateuser', vParams);
            console.log("responseUser",responseUser);
            if(responseUser != 'fail'){
                let token =await loginController.tokenService.createToken(pRequest);
                pResponse.json({'status':1,data:token,userId:responseUser});
            }
            else{
                ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 9006, '' );
            }
        }
        else{
            ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 9004, '' );
        }
    }
    async signup(pRequest, pResponse) {
        if(pRequest.body.email && pRequest.body.name && pRequest.body.password && pRequest.body.address){
           let  password = pRequest.body.password.trim();
            password = encyption.getEncryptedPassword(password);
            let vParams = {
                'puseremail':pRequest.body.email,
                'pname':pRequest.body.name,
                'ppassword':password,
                'paddress':pRequest.body.address
            }
            let responseUser = await DataAccessService.executeSP('adduser', vParams);
            if(responseUser != 'fail'){
                pResponse.status(200).send({'status':1,data:responseUser});
            }
            else{
                ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 9005, '' );
            }
        }
        else{
            ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 9003, '' );

        }
    }

}
