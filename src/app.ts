import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import logger from './util/logger';
import { CommandChain } from './handler/ICommandHandler';
import { HostConnectHandler } from './handler/HostConnectHandler';
import weak from 'weak-napi'

const app = express();

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// weak reference
// let obj = {
//   a: true
// , foo: 'bar'
// }

// // Here's where we set up the weak reference
// let ref = weak(obj, function () {
// // `this` inside the callback is the EventEmitter.
// console.log('"obj" has been garbage collected!')
// })

// // While `obj` is alive, `ref` proxies everything to it, so:
// let test = weak.get(ref);
// if( test){
//   test.a=== obj.a;
//   test.foo === obj.foo 
// }

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
