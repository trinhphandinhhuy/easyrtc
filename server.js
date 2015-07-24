"use strict";

// Load required modules
var fs          = require("fs");            // File system core module
var http        = require("http");          // Http server core module
var https       = require("https");        // Https server core module
var express     = require("express");       // Web framework module
var socketIo    = require("socket.io");     // Web socket module
var easyrtc     = require("easyrtc");       // EasyRTC module
var grace       = require("grace");         // Graceful shutdown module
var morgan      = require("morgan");        // Express logging middleware

var config      = require("./config");      // Application configuration
var log         = require("./lib/log");     // Logging handlers


// Application scope variable to hold EasyRTC public object
var easyrtcPub;
var socketServer;


// Set up graceful shutdown code
var graceApp = grace.create();

graceApp.on("start", function () {
    // Set Process Name (visible in Linux; often truncated to 16 characters)
    process.title = config.processTitle;

    log.info("Starting EasyRTC Demo Server");

    // Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
    var httpApp = express();
    httpApp.use(morgan(log.expressLogMorgan.format, log.expressLogMorgan));
    if (config.serverLogExpressEnable) {
        httpApp.use(morgan(log.serverLogMorgan.format, log.serverLogMorgan));
    }
    httpApp.use(express.static(config.httpPublicRootFolder));

    easyrtc.on("log", function (level, logText, logFields) {
        if (typeof logFields !== 'undefined') {
            log.log(level, "EasyRTC: " + logText, logFields);
        } else {
            log.log(level, "EasyRTC: " + logText);
        }
    });

    // Start Express http server
    var webServer;
    if (config.sslEnable){
        webServer = https.createServer(
            {
                "key": fs.readFileSync(config.sslKeyFile),
                "cert": fs.readFileSync(config.sslCertFile)
            },
            httpApp
            ).listen(
                config.webServerPort
            );
    } else {
        webServer = http.createServer(httpApp).listen(config.webServerPort);
    }
    log.info("Sever will be listening on port ["+config.webServerPort+"]");

    // Start Socket.io so it attaches itself to Express server
    socketServer = socketIo.listen(webServer, {"log level": config.socketIoLogLevel});

    // Setting EasyRTC Options
    easyrtc.setOption("logLevel", config.serverLogConsoleLevel);
    easyrtc.setOption("logColorEnable", config.serverLogConsoleColorEnable);
    easyrtc.setOption("logMessagesEnable", config.serverLogMessagesEnable);
    easyrtc.setOption("appIceServers", config.easyrtcAppIceServers);

    easyrtc.listen(httpApp, socketServer, null, function (err, newEasyrtcPub) {
        if (err) {
            throw err;
        }
        easyrtcPub = newEasyrtcPub;
    });

});

graceApp.on("shutdown", function (callback) {
    // Disallow new incoming connections
    try {
        log.info("Shutting down EasyRTC Demo Server");

        if (socketServer && socketServer.server) {
            socketServer.server.close();
        }
    } catch (err) {
        if (err) {
            console.log("Error returned during shutdown.", err);
        }
    }

    // Run the EasyRTC Shutdown event which will safely disconnect users.
    // easyrtcPub.eventHandler.emit("shutdown", callback);
    callback();
});

// graceApp.on("exit", function (code) {});
graceApp.timeout(2000, function (callback) {
    //The timeout is used if the shutdown task takes more time than expected
    callback();
});

graceApp.start();