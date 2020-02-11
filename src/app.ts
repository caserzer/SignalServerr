import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as statisticController from './controller/StatisticController';
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

app.get('/statistic/conns', statisticController.getConnections)

//start our server
server.listen(Number.parseInt(appPort!), () => {
  logger.info("server start");
});


