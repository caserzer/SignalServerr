import express from 'express';
import * as http from 'http';
import WebSocket = require('ws');
import * as WebSocketN from 'ws';

import { CommandChain } from '../src/handler/ICommandHandler';
import { HostConnectHandler } from '../src/handler/HostConnectHandler';

describe('HostConnect Command E2E Test', function () {
    const testServer = "ws://localhost:8080";

    const app = express();

    const server = http.createServer(app);

    //initialize the WebSocket server instance
    const wss = new WebSocketN.Server({ server });

    beforeAll(done => {
        const commandChain = new CommandChain(wss);
        commandChain.AddHandler(new HostConnectHandler());
        //start server
        server.listen(8080, () => {
            console.log("server start"); 
            done(); 
        });
    });

    afterAll(done => {
        server.close(()=>{
            done();
        });
    });




    it('Simple Scenario 1', done=> {
        let client1 = new WebSocket(testServer);
        // client1.
        client1.on("open",()=>{
            client1.send('{"msgId":100, "command":"hostConnectReq","hostId":"CLIENT1", "src":"host","version":1.0}');
        });
        client1.on("message",(msg: string) => {
            
            expect(msg).toBe("hello open command");
            done();
        });
    }

    )
})