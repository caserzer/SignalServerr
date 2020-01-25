import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import logger from './util/logger';
import { CommandChain } from './handler/ICommandHandler';
import { HostConnectHandler } from './handler/HostConnectHandler';

const app = express();

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });



const commandChain = new CommandChain(wss);
commandChain.AddHandler(new HostConnectHandler());


//start our server
server.listen(8080, () => {
  //console.log("server start");  
  logger.info("server start");
});
