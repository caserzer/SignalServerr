import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import logger from './util/logger';
import { CommandChain, HostConnectHandler } from './handler/ICommandHandler';

const app = express();

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const commandChain = new CommandChain(wss);
commandChain.AddHandler( new HostConnectHandler());
// wss.on('connection', (ws: WebSocket) => {

//     //connection is up, let's add a simple simple event
//     ws.on('message', (message: string) => {

//         //log the received message and send it back to the client
        
//         logger.info(`recevied : ${ message}`);

//         ws.send(`Hello, you sent -> ${message}`);
//     });

//     //send immediatly a feedback to the incoming connection    
//     ws.send('Hi there, I am a WebSocket server');
// });

//start our server
server.listen(8080, () => {
  //console.log("server start");  
  logger.info("server start");
});
