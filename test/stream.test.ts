import express from 'express';
import * as http from 'http';
import WebSocket = require('ws');
import * as WebSocketN from 'ws';

import { CommandChain } from '../src/handler/ICommandHandler';
import { HostConnectHandler } from '../src/handler/HostConnectHandler';
import { PlayHandler, StartStreamingHandler } from "../src/handler/PlayHandler";
import { StreamHandler, SDPHandler } from "../src/handler/StreamHandler";

import waitForExpect from "wait-for-expect";


describe('STREAM E2E Test', function () {
    const testServer = "ws://localhost:8081";

    const app = express();

    const server = http.createServer(app);

    //initialize the WebSocket server instance
    const wss = new WebSocketN.Server({ server });

    beforeAll(done => {
        const commandChain = new CommandChain(wss);
        commandChain.AddHandler(new HostConnectHandler());
        commandChain.AddHandler(new PlayHandler());
        commandChain.AddHandler(new StartStreamingHandler());
        commandChain.AddHandler(new StreamHandler());
        commandChain.AddHandler(new SDPHandler());
        //start server
        server.listen(8081, () => {
            console.log("server start");
            done();
        });
    });

    afterAll(done => {
        server.close(() => {
            done();
        });
    });



    it('Streamer simple test ', done => {
        let streamerClient = new WebSocket(testServer);
        streamerClient.on("open", () => {
            streamerClient.send(`{"msgId":101, "command":"streamReq","streamChannel":"6c7ad0ac-c614-6d9b-e54c-b63af55c03cb", "src":"streamer","version":1.0}`)
            done();
        });
    })

    it('HOST PLAYER STREAMER SDP', async () => {

        let streamChannelFromPlayer: string = "1";
        let streamChannelFromSignal: string = "2";
        let hostMessageNumber = 0;
        let hostClient = new WebSocket(testServer);
        let playerConnectionClosed = false;
        let streamerMessageCount = 0;


        hostClient.on("open", () => {
            hostClient.send('{"msgId":100, "command":"hostConnectReq","hostId":"HOST1", "src":"host","version":1.0}');
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
                hostClient.send(`{"msgId":101, "command":"startStreamingRsp","streamChannel":"${streamChannelFromSignal}","version":1.0,"success":true,"reason":""}`);

                let streamerClient = new WebSocket(testServer);
                streamerClient.on("open", () => {
                    streamerClient.send(`{"msgId":101, "command":"streamReq","streamChannel":"${streamChannelFromSignal}", "src":"streamer","version":1.0}`)
                    streamerClient.send("streamerMessage1");
                    streamerClient.send("streamerMessage2");
                });

                streamerClient.on("message", (streamerMsg: string) => {
                    if (streamerMessageCount == 0) {
                        expect(streamerMsg).toBe("playerMessage1");
                    }
                    if (streamerMessageCount == 1) {
                        expect(streamerMsg).toBe("playerMessage2");
                        streamerClient.close();
                    }

                    streamerMessageCount++;
                });

            }
            hostMessageNumber++;
        });


        let playerMessageReceivedCount = 0;
        let player = new WebSocket(testServer);
        player.on("open", () => {
            player.send('{"msgId":101, "command":"playReq", "src":"player","version":1.0, "ipc":"HOST1-ipcxxxx","encoding":"vp8","channel":0,"duration":60}');
        });
        player.on("message", (msg: string) => {
            console.log(msg);
            if (playerMessageReceivedCount === 0) {
                let jsonObj = JSON.parse(msg);
                expect(jsonObj.msgId).toBe(101);
                expect(jsonObj.command).toBe("playRsp");
                expect(jsonObj.success).toBeTruthy();
                streamChannelFromPlayer = jsonObj.streamChannel;
            }
            if (playerMessageReceivedCount === 1) {
                expect(msg).toBe("streamerMessage1");
            }
            if (playerMessageReceivedCount === 2) {
                expect(msg).toBe("streamerMessage2");
                player.send("playerMessage1");
                player.send("playerMessage2");
            }
            playerMessageReceivedCount++;
        });
        player.on("close", () => {
            playerConnectionClosed = true;
        });

        await waitForExpect(() => {
            expect(streamChannelFromPlayer).toEqual(streamChannelFromSignal);
            expect(playerConnectionClosed).toBeTruthy();
            expect(streamerMessageCount).toBe(2);
            expect(playerMessageReceivedCount).toBe(3);
        });
    }
    )


})