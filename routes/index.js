var express = require('express')
var router = express.Router()

var product_controller_1 = require("../ws/products/products");
var productCtrl = new product_controller_1.productController();

var login_controller_1 = require("../ws/login/login");
var loginCtrl = new login_controller_1.loginController();

var token_service_1 = require("../utils/services/token.service");
var tokenService = new token_service_1.Token();

//login controller
router.post(
    "/login",
    loginCtrl.login
);
router.post(
    "/signup",
    loginCtrl.signup
);
//routes start
router.get(
    "/products",
    tokenService.verifyToken,
    productCtrl.getProducts
);
router.post(
    "/addtocart",
    tokenService.verifyToken,
    productCtrl.addToCart
);
router.post(
    "/getcartdetails",
    tokenService.verifyToken,
    productCtrl.geCartDetails
);
router.post(
    "/clearcartdetails",
    tokenService.verifyToken,
    productCtrl.clearCartDetails
);

module.exports = router
