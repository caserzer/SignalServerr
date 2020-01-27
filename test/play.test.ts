import express from 'express';
import * as http from 'http';
import WebSocket = require('ws');
import * as WebSocketN from 'ws';

import { CommandChain } from '../src/handler/ICommandHandler';
import { HostConnectHandler } from '../src/handler/HostConnectHandler';
import { PlayHandler, StartStreamingHandler } from "../src/handler/PlayHandler";
import waitForExpect from "wait-for-expect";

describe('Play E2E Test', function () {
    const testServer = "ws://localhost:8082";

    const app = express();

    const server = http.createServer(app);

    //initialize the WebSocket server instance
    const wss = new WebSocketN.Server({ server });

    beforeAll(done => {
        const commandChain = new CommandChain(wss);
        commandChain.AddHandler(new HostConnectHandler());
        commandChain.AddHandler(new PlayHandler());
        commandChain.AddHandler(new StartStreamingHandler());
        //start server
        server.listen(8082, () => {
            console.log("server start");
            done();
        });
    });

    afterAll(done => {
        server.close(() => {
            done();
        });
    });




    it('Host not connect', done => {
        let player = new WebSocket(testServer);
        player.on("open", () => {
            player.send('{"msgId":100, "command":"playReq", "src":"player","version":1.0, "ipc":"fakehostid-ipcxxxx","encoding":"vp8","channel":0,"duration":60}');
        });
        player.on("message", (msg: string) => {
            let jsonObj = JSON.parse(msg);
            expect(jsonObj.msgId).toBe(100);
            expect(jsonObj.command).toBe("playRsp");
            expect(jsonObj.success).toBeFalsy();
        });
        player.on("close", (code: number, reason: string) => {
            expect(code).toBe(1008);
            done();
        });
    }
    )

    it('HOST IS READY and RSP SUCCESS', async () => {

        let streamChannelFromPlayer: string = "1";
        let streamChannelFromSignal: string = "2";
        let messageNumber = 0;
        let hostClient = new WebSocket(testServer);

        hostClient.on("open", () => {
            hostClient.send('{"msgId":100, "command":"hostConnectReq","hostId":"HOST1", "src":"host","version":1.0}');
        });
        hostClient.on("message", (msg: string) => {
            console.log(msg);
            let jsonObj = JSON.parse(msg);


            if (messageNumber === 0) {
                expect(jsonObj.msgId).toBe(100);
                expect(jsonObj.command).toBe("hostConnectRsp");
                expect(jsonObj.success).toBeTruthy();
            }
            if (messageNumber === 1) {
                expect(jsonObj.msgId).toBe(101);
                expect(jsonObj.command).toBe("startStreamingReq");
                streamChannelFromSignal = jsonObj.streamChannel;
                hostClient.send(`{"msgId":101, "command":"startStreamingRsp","streamChannel":"${streamChannelFromSignal}","version":1.0,"success":true,"reason":""}`);

            }
            messageNumber++;
        });


        let player = new WebSocket(testServer);
        player.on("open", () => {
            player.send('{"msgId":101, "command":"playReq", "src":"player","version":1.0, "ipc":"HOST1-ipcxxxx","encoding":"vp8","channel":0,"duration":60}');
        });
        player.on("message", (msg: string) => {
            let jsonObj = JSON.parse(msg);
            expect(jsonObj.msgId).toBe(101);
            expect(jsonObj.command).toBe("playRsp");
            expect(jsonObj.success).toBeTruthy();
            streamChannelFromPlayer = jsonObj.streamChannel;
        });

        await waitForExpect(() => {
            expect(streamChannelFromPlayer).toEqual(streamChannelFromSignal);
            console.log(streamChannelFromPlayer);
        });
    }
    )

    it('HOST IS READY and RSP FAIL', async () => {

        let streamChannelFromPlayer: string = "1";
        let streamChannelFromSignal: string = "2";
        let hostMessageNumber = 0;
        let hostClient = new WebSocket(testServer);
        let playerConnectionClosed = false;

        hostClient.on("open", () => {
            hostClient.send('{"msgId":100, "command":"hostConnectReq","hostId":"HOST2", "src":"host","version":1.0}');
        });
        hostClient.on("message", (msg: string) => {
            let jsonObj = JSON.parse(msg);

            if (hostMessageNumber === 0) {
                expect(jsonObj.msgId).toBe(100);
                expect(jsonObj.command).toBe("hostConnectRsp");
                expect(jsonObj.success).toBeTruthy();
            }
            if (hostMessageNumber === 1) {
                expect(jsonObj.msgId).toBe(101);
                expect(jsonObj.command).toBe("startStreamingReq");
                streamChannelFromSignal = jsonObj.streamChannel;
                hostClient.send(`{"msgId":101, "command":"startStreamingRsp","streamChannel":"${streamChannelFromSignal}","version":1.0,"success":false,"reason":""}`);

            }
            hostMessageNumber++;
        });


        let playerMessageReceivedCount = 0;
        let player = new WebSocket(testServer);
        player.on("open", () => {
            player.send('{"msgId":101, "command":"playReq", "src":"player","version":1.0, "ipc":"HOST2-ipcxxxx","encoding":"vp8","channel":0,"duration":60}');
        });
        player.on("message", (msg: string) => {
            let jsonObj = JSON.parse(msg);
            console.log(msg);
            if (playerMessageReceivedCount === 0) {
                expect(jsonObj.msgId).toBe(101);
                expect(jsonObj.command).toBe("playRsp");
                expect(jsonObj.success).toBeTruthy();
                streamChannelFromPlayer = jsonObj.streamChannel;
            }
            if (playerMessageReceivedCount === 1) {
                expect(jsonObj.msgId).toBe(101);
                expect(jsonObj.command).toBe("playRsp");
                expect(jsonObj.success).toBeFalsy();
                //streamChannelFromPlayer = jsonObj.streamChannel;
            }
            playerMessageReceivedCount++;
        });
        player.on("close", () => {
            playerConnectionClosed = true;
        });

        await waitForExpect(() => {
            expect(streamChannelFromPlayer).toEqual(streamChannelFromSignal);
            expect(playerConnectionClosed).toBeTruthy();
        });
    }
    )



})