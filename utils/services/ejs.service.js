import { Logging } from './logging.service';
const vEnv = require('../../config/server_config/mode.json')['mode'];
const vConfig = require('../../config/server_config/config.json')[vEnv];
const vEjs = require('ejs');
const vPath = require('path');
const fs = require('fs');
export class EJSService {
    constructor() {
        Logging('Initialize EJS Service');
    }
    static ejsrenderer(ejsFile, params) {
        let message;
        let fileName = vConfig.EJSConfig.EmailTemplate[ejsFile];
        let filePath = vPath.join(__dirname, '../', fileName);
        Logging("filePath : " + filePath);
        var content = fs.readFileSync(filePath, 'utf8');
        message = vEjs.render(content, params);
        return message;
    }
}
