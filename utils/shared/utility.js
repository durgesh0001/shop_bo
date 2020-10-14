var moment = require('moment');
export var Utility;
(function (Utility) {
    function replaceAll(pString, pSearch, pReplacement) {
        return pString.replace(new RegExp(pSearch, 'g'), pReplacement);
    }
    Utility.replaceAll = replaceAll;

    function sortJSON(pJSONObject, pSortKey, pASC) {
        let vAsc = pASC ? true : false;
        return pJSONObject.sort(function (a, b) {
            if (typeof a[pSortKey] === 'number') {
                return vAsc ? a[pSortKey] - b[pSortKey] : b[pSortKey] - a[pSortKey];
            }
            else if (typeof a[pSortKey] === 'string') {
                if (vAsc) {
                    return (a[pSortKey] > b[pSortKey]) ? 1 : ((a[pSortKey] < b[pSortKey]) ? -1 : 0);
                }
                else {
                    return (b[pSortKey] > a[pSortKey]) ? 1 : ((b[pSortKey] < a[pSortKey]) ? -1 : 0);
                }
            }
        });
    }
    Utility.sortJSON = sortJSON;
    function filterByLastNumberOfMonth(data, numberOfMonth, key) {
        var vData = data;
        var returnVData = [];
        var dateFrom = moment().subtract(numberOfMonth, 'months').format('YYYY-MM-DD');
        for (var i = 0; i < vData.length; i++) {
            if (vData[i][key] && (vData[i][key] != undefined || vData[i][key] != 'undefined' || vData[i][key] != null || vData[i][key] != 'null')) {
                if (new Date(vData[i][key]) > new Date(dateFrom)) {
                    returnVData.push(vData[i]);
                }
            }
        }
        return removeDuplicateKeysValue(key, returnVData);
    }
    Utility.filterByLastNumberOfMonth = filterByLastNumberOfMonth;
    function removeDuplicateKeysValue(key, data) {
        function hash(o) {
            return o[key];
        }
        var hashesFound = {};
        data.forEach(function (o) {
            hashesFound[hash(o)] = o;
        });
        var results = Object.keys(hashesFound).map(function (k) {
            return hashesFound[k];
        });
        return results;
    }
    function excludeJSON(obj, type, filter) {
        var vData = obj;
        for (let i = 0; i < vData.length; i++) {
            if (vData[i][type] == filter) {
                vData.splice(i, 1);
                i -= 1;
            }
        }
        return vData;
    }
    Utility.excludeJSON = excludeJSON;
    function findJSON(obj, type, filter) {
        var temp = [];
        for (var data in obj) {
            if (obj[data][type] == filter)
                temp.push(obj[data]);
        }
        return temp;
    }
    Utility.findJSON = findJSON;
    function getMonth(date) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return monthNames[parseInt(date) - 1];
    }
    Utility.getMonth = getMonth;
    function getFormattedDate(datestr) {
        var year = parseInt(datestr.substr(4, 4));
        var month = parseInt(datestr.substr(2, 2));
        var date = parseInt(datestr.substr(0, 2));
        var d = new Date(year, month - 1, date);
        d.setDate(d.getDate() + 1);
        return d.getDate() + " " + Utility.getMonth(d.getMonth() + 1) + " " + d.getFullYear();
    }
    Utility.getFormattedDate = getFormattedDate;
    function getTime(str) {
        var hh = parseInt(str.substr(0, 2)) * 60 * 60;
        var mm = parseInt(str.substr(3, 2)) * 60;
        var ss = parseInt(str.substr(6, 2));
        return hh + mm + ss;
    }
    Utility.getTime = getTime;
    function getHHMMSS(sec_num) {
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var h = hours;
        var m = minutes;
        var s = seconds;
        if (hours < 10) {
            h = "0" + hours;
        }
        if (minutes < 10) {
            m = "0" + minutes;
        }
        if (seconds < 10) {
            s = "0" + seconds;
        }
        return h + ':' + m + ':' + s;
    }
    Utility.getHHMMSS = getHHMMSS;
    function cloneObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        var temp = obj.constructor(); // give temp the original obj's constructor
        for (var key in obj) {
            temp[key] = cloneObject(obj[key]);
        }
        return temp;
    }
    Utility.cloneObject = cloneObject;
    function getRandomSerial(length) {
        var crypto = require("crypto");
        var chars = "0123456789";
        var max = length;
        var code = "";
        var rnd = crypto.randomBytes(max);
        var value = new Array(max);
        var len = chars.length;
        for (var i = 0; i < max; i++) {
            value[i] = chars[rnd[i] % len];
            code += value[i];
        }
        return (code);
    }
    Utility.getRandomSerial = getRandomSerial;
    function getCurrentDateTime() {
        var current = new Date();
        var year = current.getFullYear();
        var month = ('0' + (current.getMonth() + 1)).slice(-2);
        var day = ('0' + current.getDate()).slice(-2);
        var hour = ('0' + current.getHours()).slice(-2);
        var minute = ('0' + current.getMinutes()).slice(-2);
        var sec = ('0' + current.getSeconds()).slice(-2);
        var dateTime = {
            pYear: year,
            pMonth: month,
            pDay: day,
            pHour: hour,
            pMinute: minute,
            pSecond: sec
        };
        return dateTime;
    }
    Utility.getCurrentDateTime = getCurrentDateTime;
})(Utility || (Utility = {}));
