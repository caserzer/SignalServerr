import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as statisticController from './controller/StatisticController';
import * as serverController from './controller/ServersController';
import { HostConnectHandler } from './handler/HostConnectHandler';
import { CommandChain } from './handler/ICommandHandler';
import { PlayHandler, StartStreamingHandler } from './handler/PlayHandler';
import { SDPHandler, StreamHandler } from './handler/StreamHandler';
import { UnRecognizedCommandHandler } from "./handler/UnRecognizedCommandHandler";
import logger from './util/logger';
import { APP_PORT } from './util/secrets';


const app = express();

const server = http.createServer(app);

const appPort = APP_PORT;

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const commandChain = new CommandChain(wss);
commandChain.AddHandler(new HostConnectHandler());
commandChain.AddHandler(new PlayHandler());
commandChain.AddHandler(new StartStreamingHandler());
commandChain.AddHandler(new StreamHandler());
commandChain.AddHandler(new SDPHandler());
commandChain.AddHandler(new UnRecognizedCommandHandler());

//set CORNS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//set router
app.get('/statistic/conns', statisticController.getConnections);
app.get('/servers', serverController.getServers);

//start our server
server.listen(Number.parseInt(appPort!), () => {
  logger.info("server start");
});


