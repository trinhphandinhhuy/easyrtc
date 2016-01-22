"use strict";

var winston = require("winston");       // Winston logging module
var config = require("../config");      // Application configuration

require('winston-logstash');

var logTransports = [];

if (config.serverLogConsoleEnable) {
    logTransports.push(
        new (winston.transports.Console)({
            "level": config.serverLogConsoleLevel,
            "timestamp": config.serverLogConsoleTimestampEnable,
            "colorize": config.serverLogConsoleColorEnable
        })
    );
}

if (config.serverLogFileEnable) {
    logTransports.push(
        new (require("winston-daily-rotate-file"))({
            "filename": config.serverLogFile,
            "timestamp": config.serverLogFileTimestampEnable
        })
    );
}

if (config.serverLogLogstashEnable)
logTransports.push(
    new (winston.transports.Logstash)({
        "host": config.serverLogLogstashHost,
        "port": config.serverLogLogstashPort,
        "node_name": config.serverLogLogstashNodeName,
        "level": config.serverLogLogstashLevel,
        "handleExceptions": true
    })
);

var log = new (winston.Logger)({
    "transports": logTransports
});

log.expressLog = new (winston.Logger)({
    "transports": [
        new (require("winston-daily-rotate-file"))({
            "filename": config.expressLogFile,
            "json": false
        })
    ]
});

log.expressLogStream = {"write": function (msg) {
    log.expressLog.info(msg.replace("\n", ""));
}};

log.expressServerLogStream = {"write": function (msg) {
    log.debug("Express: " + msg.replace("\n", ""));
}};


log.expressLogMorgan = {"format": config.expressLogExpressFormat, "stream": log.expressLogStream};
log.serverLogMorgan = {"format": config.serverLogExpressFormat, "stream": log.expressServerLogStream};
module.exports = log;