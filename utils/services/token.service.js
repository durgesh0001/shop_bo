import { TokenModel } from '../model/token.model';
import { ErrorHandlingService } from './error-handling.service';
import { Logging } from './logging.service';
import { DataAccessService } from './data-access.service';
var vEnv = require('../../config/server_config/mode.json')['mode'];
var vConfig = require('../../config/server_config/config.json')[vEnv];
var vNJwt = require('njwt');
var CryptoJS = require('crypto-js');
var request = require('request');
export class Token {
    constructor() {
        Logging('initialize token service');
    }
    static encryptToken(pObject) {
        try {
            // load sign in key from config files
            let vSigningkey = vConfig.token.key;
            // encrypt token
            let vJwt = vNJwt.create(pObject, vSigningkey);
            vJwt.setExpiration(new Date().getTime() + this.vTimeout);
            let vToken = vJwt.compact();
            return vToken;
        }
        catch (pErr) {
            ErrorHandlingService.throwError(300, pErr.toString());
        }
    }

    static decryptToken(pToken) {
        try {
            // load sign in key from config files
            let vSigningkey = vConfig.token.key;
            let vVerifiedJwt = vNJwt.verify(pToken, vSigningkey).body;
            let vTokenObject = new TokenModel();
            vTokenObject.setemailForLogin(vVerifiedJwt.emailForLogin);
            return vTokenObject;
        }
        catch (pErr) {
            ErrorHandlingService.throwError(300, 'Invalid Access Token');
        }
    }
    async createToken(pRequest) {
        if (pRequest.method == 'OPTIONS')
            next();
        try {
            let vTokenObject = {};
            let vParams = {
                'puseremail':pRequest.body.email
            }
            let responseUser = await DataAccessService.executeSP('validateuseremail', vParams);
            console.log("responseUser","email",responseUser);
            console.log(vParams);
            if (responseUser != 'fail') {
                let tokenObj = new TokenModel();
                tokenObj.setemailForLogin(pRequest.body.email);
                vTokenObject = tokenObj;
            }
            else {
                ErrorHandlingService.throwHTTPErrorResponse(pResponse, 403, 300, 'User does not exist');
                return;
            }
            let vNewAccessToken = Token.encryptToken(vTokenObject);
            let vNewToken = Token.decryptToken(vNewAccessToken);
            console.log(vNewToken);
            return vNewAccessToken

        }
        catch (ex) {
            ErrorHandlingService.throwHTTPErrorResponse(pResponse, 403, 300, 'Invalid Access Token');
        }
    }


    async verifyToken(pRequest, pResponse, next) {
        if (pRequest.method == 'OPTIONS')
            next();
        try {
            let vToken = pRequest.get('authorization').replace('Bearer ', '');
            let vTokenObject = Token.decryptToken(vToken);
            pResponse.locals.token = vTokenObject;
            let vParams = {
                'puseremail':vTokenObject.getemailForLogin()
            }
            let responseUser = await DataAccessService.executeSP('validateuseremail', vParams);
            if (responseUser != 'fail') {
                let tokenObj = new TokenModel();
                tokenObj.setemailForLogin(vTokenObject.getemailForLogin());
                vTokenObject = tokenObj;
            }
            else {
                ErrorHandlingService.throwHTTPErrorResponse(pResponse, 403, 300, 'User does not exist');
                return;
            }
            let vNewAccessToken = Token.encryptToken(vTokenObject);
            pResponse.header('accessToken', vNewAccessToken);
            pResponse.header('created', Date.now());
            next();
        }
        catch (ex) {
            ErrorHandlingService.throwHTTPErrorResponse(pResponse, 403, 300, 'Invalid Access Token');
        }
    }
}
Token.vTimeout = 60 * 60 * 1000; //60 minutes
