global.__base = __dirname + '/';
global.__logs = __dirname + '/logs/';
global.__instanceId = 0;


var busboy = require('connect-busboy');
var bodyParser = require('body-parser');
var express = require('express');
var expressValidator = require('express-validator');
var fs = require('fs');
var http = require('http');
var passport = require('passport/lib');
var vValidator = require('validator');
var cookieParser = require('cookie-parser');
var app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(expressValidator());
app.use(passport.initialize());
app.use('/api/static', express.static(__dirname + '/app/reports/avatars'));


var vEnv = require('./config/server_config/mode.json')['mode'];
var configServer = require('./config/server_config/config.json')[vEnv];


// UNCOMMENT whitelist origin function for localhost purpose !!
// START Comment Whitelist
var whiteList = function (origin) {
    var data = configServer.whitelist_domain;
    for (var i in data) {
        if (origin == data[i])
            return origin;
    }
    if (data.length == 0)
        return null;
    else
        return data[0];
};
// END Comment Whitelist



var logging_service_1 = require("./utils/services/logging.service");
var logging_service_2 = require("./utils/services/logging.service");
var sequelize_service_1 = require("./utils/services/sequelize.service");
var seq = new sequelize_service_1.SequelizeService();
var encryption_service_1 = require("./utils/services/encryption.service");

var port = configServer.port || 4000;

var enc = new encryption_service_1.EncryptionService();
var wlog = new logging_service_2.WLog();
var allow;

const routes = require("./routes");

app.use(express.static('public'));

app.use("/api/*", function(req, res, next) {
    console.log(req.url);
    //update
    // UNCOMMENT response header for localhost purpose !!
    /*START of comment out response header*/
    var origin = req.get("origin");
    var vOrigin = whiteList(origin);
    res.header("Access-Control-Allow-Origin", vOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept,authorization,Proxy-Authorization,X-session"
    );
    res.header(
        "Access-Control-Expose-Headers",
        "accessToken,created,Content-Disposition"
    );
    res.header("Access-Control-Allow-Methods", "GET,PUT,DELETE,POST");
    res.header("X-XSS-Protection", "1");
    res.header("X-Content-Type-Options", "nosniff");
    res.header(
        "Content-Security-Policy",
        "object-src 'none';img-src 'self';media-src 'self';frame-src 'none';font-src 'self' data:;connect-src 'self';style-src 'self'"
    );
    /*END of Comment out response header*/
    logging_service_1.Logging("incoming request host : " + req.headers.host);
    logging_service_1.Logging("Incoming request method : " + req.method);
    logging_service_1.Logging("Incoming request path : " + req.path);
    logging_service_1.Logging("cookies : " + JSON.stringify(req.cookies));
    var encryption = configServer.encryption;
    var f = res.send;
    var f2 = res.json;
    if (encryption) {
        res.oldSend = function(param) {
            var data = param;
            this.encrypt = false;
            f.call(this, data);
        };
        res.oldJson = function(param) {
            var data = param;
            this.encrypt = false;
            f2.call(this, data);
        };
        res.json = function(param) {
            var data = param;
            logging_service_1.Logging("test");
            logging_service_1.Logging(data);
            data = enc.getEncrypted(JSON.stringify(data));
            f.call(this, data);
        };
        res.send = function(param) {
            var data = param;
            var param2 = this.encrypt;
            if (
                param2 == undefined &&
                Object.prototype.toString.call(data) == "[object Object]"
            )
                data = JSON.stringify(data);
            else if (
                param2 == undefined &&
                Object.prototype.toString.call(data) == "[object Array]"
            )
                data = JSON.stringify(data);
            if (param2 == undefined) data = enc.getEncrypted(data);
            f.call(this, data);
        };
    }
    if (
        req.method === "POST" ||
        req.method === "PUT" ||
        req.method === "DELETE"
    ) {
        // ----------------------------------------------------------
        // Here below the Decryptin logic
        logging_service_1.Logging("req.body         : " + req.body);
        if (req.body.encoded != undefined) {
            logging_service_1.Logging("req.body.encoded : " + req.body.encoded);
            if (configServer.encryption)
                req.body = req.body.encoded.replace(/ /g, "+");
            else req.body = req.body.encoded;
            req.body = enc.getDecrypted(req.body);
            logging_service_1.Logging("req.body replace : " + req.body);
            // replace ',' separator with ';'
            var temp = "";
            var kar = "";
            var _loop_1 = function(i) {
                kar = req.body[i];
                if (kar == ",") {
                    isSeparator = function() {
                        for (var j = i + 1; j < req.body.length; j++) {
                            if (req.body[j] == ",") {
                                return false;
                            }
                            if (req.body[j] == "=") {
                                return true;
                            }
                        }
                        return true;
                    };
                    if (isSeparator()) {
                        kar = ";";
                    }
                }
                temp += kar;
            };
            var isSeparator;
            for (var i = 0; i < req.body.length; i++) {
                _loop_1(i);
            }
            req.body = temp;
            //req.body=req.body.replace(/,/g,';');
            logging_service_1.Logging(req.body);
            req.body = req.body.replace(/{|}/g, "");
            logging_service_1.Logging(req.body);
            // convert string to JSON Object
            var y = {};
            req.body
                .split(";")
                .map(function(i) {
                    return i.split("=");
                })
                .forEach(function(j) {
                    y[j[0].trim()] = j[1];
                });
            logging_service_1.Logging(y);
            req.body = y;
        } else if (req.body.json != undefined) {
            if (configServer.encryption)
                req.body = req.body.json.replace(/ /g, "+");
            else req.body = req.body.json;
            logging_service_1.Logging(req.body);
            req.body = enc.getDecrypted(req.body);
            logging_service_1.Logging(req.body);
            req.body = JSON.parse(req.body);
        }
        // ---------------------------------------------------------------
        for (let param in req.body) {
            if (typeof req.body[param] === "string")
                req.body[param] = vValidator.escape(req.body[param]);
        }
    } else if (req.method === "GET") {
        for (let param in req.query) {
            if (typeof req.query[param] === "string")
                req.query[param] = vValidator.escape(req.query[param]);
        }
        for (let param in req.params) {
            if (typeof req.params[param] === "string")
                req.params[param] = vValidator.escape(req.params[param]);
        }
    }
    next();
});
//routes start
app.use('/api',routes);
//routes end
const serversocket = http
    .createServer(app)
    .listen(configServer.port, function() {
        console.log("server running on port " + configServer.port);
    });
var clients = {};
global.io = require("socket.io")(serversocket);
global.io.on("connection", function(socket) {
    clients[socket.id] = socket;
    console.log("socket connection working");
    console.log(socket.id);
    socket.on("disconnect", function() {
        console.log("disconnect delete socket id", clients[socket.id]);
        delete clients[socket.id];
    });
});
console.log("Node Server started on port " + configServer.port);
