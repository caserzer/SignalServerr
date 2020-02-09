import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import logger from './util/logger';
import { CommandChain } from './handler/ICommandHandler';
import { HostConnectHandler } from './handler/HostConnectHandler';
import { PlayHandler, StartStreamingHandler } from './handler/PlayHandler';
import { StreamHandler, SDPHandler, UnRecognizedCommandHandler } from './handler/StreamHandler';
import * as statisticController  from './controller/StatisticController';

const app = express();

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const commandChain = new CommandChain(wss);
commandChain.AddHandler(new HostConnectHandler());
commandChain.AddHandler(new PlayHandler());
commandChain.AddHandler(new StartStreamingHandler());
commandChain.AddHandler(new StreamHandler());
commandChain.AddHandler(new SDPHandler());
commandChain.AddHandler(new UnRecognizedCommandHandler());

app.get('/statistic/conns', statisticController.getConnections)

//start our server
server.listen(8080, () => {
  //console.log("server start");  
  logger.info("server start");
});


