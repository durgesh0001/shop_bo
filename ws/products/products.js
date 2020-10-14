import { ErrorHandlingService } from "../../utils/services/error-handling.service";
import { Logging } from "../../utils/services/logging.service";
import { DataAccessService } from "../../utils/services/data-access.service";
var vEnv = require("../../config/server_config/mode.json")["mode"];

export class productController {
  constructor() {
    Logging("initialize product controller");
  }
  async getProducts(pRequest, pResponse) {
    let responseProducts = await DataAccessService.executeSP('get_products', '');
    if(responseProducts != 'fail'){
      pResponse.status(200).send({'status':1,data:responseProducts});
    }
    else{
      ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 2001, '' );
    }
  }

  async addToCart(pRequest, pResponse) {
    if(pRequest.body.productId && pRequest.body.userId){
      let vParams = {
        pproductid: pRequest.body.productId,
        puserid: pRequest.body.userId
      };
      let responseProducts = await DataAccessService.executeSP('addtocart', vParams);
      if(responseProducts != 'fail'){
        pResponse.status(200).send({'status':1,data:'success'});
      }
      else{
        ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 2002, '' );
      }
    }
    else{
      ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 9001, '' );
    }
  }
    async clearCartDetails(pRequest, pResponse) {
        if(pRequest.body.userId){

            let vParams = {
                puserid: pRequest.body.userId
            };
            let responseCarts = await DataAccessService.executeSP('clearcart', vParams);
            if(responseCarts != 'fail'){
                pResponse.status(200).send({'status':1,data:responseCarts});
            }
            else{
                    ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 2002, '' );
            }
        }
        else{
            ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 9001, '' );
        }
    }


  async geCartDetails(pRequest, pResponse) {
    if(pRequest.body.userId){
      let promocode = ''
      if (pRequest.body.promocode){
        promocode = pRequest.body.promocode
      }
      let vParams = {
        puserid: pRequest.body.userId,
        ppromocode:promocode
      };
      let responseCarts = await DataAccessService.executeSP('validatepromo', vParams);
     if(responseCarts == 'used'){
         ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 2005, '' );
        }
      else if(responseCarts != 'fail'){
        pResponse.status(200).send({'status':1,data:responseCarts});
      }
      else{
          if(promocode){

                  ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 2004, '' );
          }
          else{
              ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 2002, '' );

          }
      }
    }
    else{
      ErrorHandlingService.throwHTTPErrorResponse(pResponse, 500, 9001, '' );
    }
  }
 }
