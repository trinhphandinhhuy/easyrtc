"use strict";

var config = module.exports;

config.httpPort     = 80;                           // Port used by http and socket server if sslEnable is false (default)
config.httpsPort    = 443;                          // Port used by http and socket server if sslEnable is true
config.httpPublicRootFolder = __dirname + "/static/";
config.processTitle = "node/EasyRTC/De";

config.easyrtcAppIceServers = [
    {url: "stun:stun.sipgate.net"},
    {url: "stun:217.10.68.152"},
    {url: "stun:stun.sipgate.net:10000"},
    {url: "stun:217.10.68.152:10000"},
    {url: "turn:192.155.84.88", "username": "easyRTC", "credential": "easyRTC@pass"},
    {url: "turn:192.155.84.88?transport=tcp", "username": "easyRTC", "credential": "easyRTC@pass"},
    {url: "turn:192.155.86.24:443", "credential": "easyRTC@pass", username: "easyRTC"},
    {url: "turn:192.155.86.24:443?transport=tcp", "credential": "easyRTC@pass", username: "easyRTC"}
];

config.sslEnable = false;
config.sslKeyFile = "./dev/ssl_self_signed/server.key";
config.sslCertFile = "./dev/ssl_self_signed/server.cert";

// Logging options
config.expressLogFile = "express.log";
config.expressLogExpressFormat = "combined";


config.serverLogConsoleEnable = true;
config.serverLogConsoleLevel = "debug";
config.serverLogConsoleTimestampEnable = true;
config.serverLogConsoleColorEnable = true;
config.serverLogExpressEnable = true;
config.serverLogExpressLevel = "debug";
config.serverLogExpressFormat = "dev";
config.serverLogMessagesEnable = false;

config.serverLogFileEnable = true;
config.serverLogFile = "server.log";
config.serverLogFileLevel = "debug";
config.serverLogFileTimestampEnable = true;

config.serverLogLogstashEnable = false;
config.serverLogLogstashLevel = "debug";
config.serverLogLogstashHost = "127.0.0.1";
config.serverLogLogstashPort = 9300;
config.serverLogLogstashNodeName = "logstash";

config.serverStreamStackEnable = false;
config.serverStreamStackServerIp = "127.0.0.1";
config.serverStreamStackUrl = "";
config.serverStreamStackAccountId = "";
config.serverStreamStackApiKey = "";

// Override options
//noinspection JSLint
if (require("fs").existsSync("./config_override.js")) {
    var configOverride = require("./" + "config_override.js");
    for (var key in configOverride) {
        if(configOverride.hasOwnProperty(key)){
            config[key] = configOverride[key];
            console.log("Config Override for ["+key+"]: ", configOverride[key]);
        }
    }
}

// Conditional options (based on other option values)
config.webServerPort = (config.sslEnable?config.httpsPort:config.httpPort);