'use strict';

var bunyan = require('bunyan');
var domain = require('domain');
var moment = require('moment');
var profiler = require('gc-profiler');
var accessLog = createLogger('access');
var applicationLog = createLogger('application');
var enterpriseBusinessLog = createLogger('enterprisebusiness');
var oauthLog = createLogger('oauth');
var productsLogError = createLogger('productserror');
var performanceLog = createLogger('performance');
var gcLog = createLogger('gc');
var eventLog = createLogger('event');
var postgresLogs = createLogger('postgreslogs');

const INSTANCE_ID = 0;
function createLogger(name){
  return bunyan.createLogger({
    name: 'applicationLog' + '_log',
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    },
    streams: [
      {
        type: 'rotating-file',
        period: '1d',
        level: 'info',
        path: 'applicationLog.log'
      }
    ]
  });
}
module.exports = {
  accessLog: accessLog,
  applicationLog: applicationLog,
  enterpriseBusinessLog: enterpriseBusinessLog,
  productsError:productsLogError,
  oauthLog: oauthLog,
  performanceLog: performanceLog,
  gcLog: gcLog,
  eventLog: eventLog,
  postgresDataAccess:postgresLogs,
  accessLogger: function (req, res, next) {
    var start = new Date();
    var end = res.end;
    res.end = function (chunk, encoding) {
      var responseTime = (new Date()).getTime() - start.getTime();
      end.call(res, chunk, encoding);
      var contentLength = parseInt(res.getHeader('Content-Length'), 10)
      var data = {
        req_id: req.id,
        ip: req.ip,
        token: req.headers.authorization,
        method: req.method,
        uri: req.url,
        status: res.statusCode,
        contentLength: isNaN(contentLength) ? 0 : contentLength,
        responseTime: responseTime
      };
      if(typeof req.user !== 'undefined'){
        data.dealerUserId = req.user.loginId;
        data.dealerCode = req.user.dealerCode;
      }
      if(typeof req.headers['x-nginx-timestamp'] !== 'undefined') {
        data.delay = moment().diff(moment(req.headers['x-nginx-timestamp'] * 1000))
      }
      accessLog.info(data, '%s %s %s %d %dms - %d octets', data.ip, data.method, data.uri, data.status, data.responseTime, data.contentLength);
      console.log(accessLog);
    }
    next();
  },
  applicationLogger: function (req, res, next) {
    var json = res.json;
    res.json = function (body) {
      json.call(res, body);
      var data = {
        req_id: req.id,
        token: req.headers.authorization,
        res: res,
        body: body,
        req: req,
        req_body: req.body,
        req_query: req.query,
      };
      applicationLog.child({TAG: 'JSON_PAYLOAD'}).info(data, '%s %s %d', data.req.method, data.req.url, data.res.statusCode);
    };
    next();
  },
  errorLogger: function (err, req, res, next) {
    applicationLog.child({TAG: 'ERROR'}).error({ req: req, res: res, error: err }, err.stack);
    next(err);
  },
  domainLogger: function (req, res, next) {
    var requestDomain = domain.create();
    requestDomain.add(req);
    requestDomain.add(res);
    requestDomain.on('error', function (err) {
      var data = { req: req, res: res, error: err };
      applicationLog.child({TAG: 'DOMAIN_UNCAUGHT'}).fatal(data, err.message);
    });
    next();
  },
  performanceLogger: function () {
    var startTime = Date.now();
    setImmediate(function () {
      var data = process.memoryUsage();
      data.uptime = process.uptime();
      data.pid = process.pid;
      data.lag = Date.now()-startTime;
      performanceLog.child({TAG: 'NODE_PERFORMANCE'}).info(data,
        'process.pid: %d heapUsed: %d heapTotal: %d rss: %d uptime %d lag: %d',
        data.pid,
        data.heapUsed,
        data.heapTotal,
        data.rss,
        data.uptime,
        data.lag
      );
    });
  }
}

function getInstanceId(){
  if(INSTANCE_ID === 0){
    return "";
  }else{
    return "_MS" + pad(INSTANCE_ID, 2);
  }
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
