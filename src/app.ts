import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { JsonConvert , OperationMode, ValueCheckingMode} from "json2typescript";
// import { CommandMessage } from "./models/Command";

const app = express();

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        // let command : CommandMessage ={ msgId : 10 , src:"src", type:"type", version:1,command:"hello"};
        // let command1 : CommandMessage ={ msgId : 10 , src:"src", type:"type", version:1,command:"hello", result:"result"};

        // let jsonConvert : JsonConvert = new JsonConvert();
        // jsonConvert.operationMode = OperationMode.LOGGING; // print some debug data
        // jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        // jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; //
        //         // let x = jsonConvert.serialize(command);
        // let y = JSON.stringify(command);
        // let y1 = JSON.stringify(command1);
        // let z = jsonConvert.deserialize(JSON.parse(y), CommandMessage);
        // let z1 = jsonConvert.deserialize(JSON.parse(y1), CommandMessage);

        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});

//start our server
server.listen(8080, () => {
  console.log("server start");  
});
