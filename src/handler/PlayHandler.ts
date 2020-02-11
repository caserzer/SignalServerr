import { Context } from "../models/Context";
import { CommandBase, CommandRequest, CommandResponse, SrcType } from "../models/Command";
import WebSocket = require("ws");
import { CommandHandler } from "./ICommandHandler";
import { JsonObject, JsonProperty } from "json2typescript";
import { EnumConverter } from "../models/EnumConvert";
import { Guid } from "guid-typescript";
import logger from "../util/logger";
import mysql from "mysql";
import fs from "fs";
import {MYSQL_HOST,MYSQL_USER,MYSQL_PASSWORD,MYSQL_DATABASE,MYSQL_PORT,MYSQL_CERTFILE,TURN_SERVER,TURN_USER,TURN_PASSWORD} from "../util/secrets"


enum EncodingType {
    H264 = "h264",
    H265 = "h265",
    VP8 = "vp8",
    VP9 = "vp9",
    AV1 = "av1",
}

export class EncodingTypeConvert extends EnumConverter<EncodingType>{
    constructor() {
        super(EncodingType);
    }
}

@JsonObject("playReq")
class PlayRequest extends CommandRequest {

    @JsonProperty("ipc", String)
    ipc: string = ""; //IPC id

    @JsonProperty("encoding", EncodingTypeConvert)
    encoding: EncodingType = EncodingType.VP8; //串流编码

    @JsonProperty("channel", Number)
    channel: number = 0;   //主辅码流

    @JsonProperty("duration", Number)
    duration: number = 60; //播放时间 秒

    constructor() {
        super();
        this.command = "playReq";
    }
}

@JsonObject("playRsp")
class PlayResponse extends CommandResponse {

    @JsonProperty("streamChannel", String)
    streamChannel: string = "";

    constructor() {
        super();
        this.command = "playRsp";
    }

}

@JsonObject("startStreamingReq")
class StartStreamingRequest extends CommandRequest {

    @JsonProperty("rtspAddress", String)
    rtspAddress: string = "";

    @JsonProperty("userName", String)
    userName: string = "";

    @JsonProperty("password", String)
    password: string = "";

    @JsonProperty("ip", String)
    ip: string = "";

    @JsonProperty("rtspEncoding", EncodingTypeConvert)
    rtspEncoding: EncodingType = EncodingType.H264;

    @JsonProperty("encoding", EncodingTypeConvert)
    encoding: EncodingType = EncodingType.VP8;

    @JsonProperty("channel", Number)
    channel: number = 0;

    @JsonProperty("duration", Number)
    duration: number = 60;

    @JsonProperty("turnServer", String)
    turnServer: string = "";

    @JsonProperty("turnUser", String)
    turnUser: string = "";

    @JsonProperty("turnPassword", String)
    turnPassword: string = "";

    @JsonProperty("streamChannel", String)
    streamChannel: string = "";

    constructor() {
        super();
        this.command = "startStreamingReq";
    }
}

@JsonObject("startStreamingRsp")
class StartStreamingResponse extends CommandResponse {

    @JsonProperty("streamChannel", String)
    streamChannel: string = "";

    constructor() {
        super();
        this.command = "startStreamingRsp";
    }

}

class PlayHandler implements CommandHandler {

    private pool = mysql.createPool({
        host: MYSQL_HOST,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        port: Number.parseInt(MYSQL_PORT!),
        ssl: { ca: fs.readFileSync(MYSQL_CERTFILE!) }
    })

    private query(sql: string, ...values: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection(function (err, connection) {
                if (err) {
                    reject(err)
                } else {
                    connection.query(sql, values, (err, rows) => {

                        if (err) {
                            reject(err)
                        } else {
                            resolve(rows)
                        }
                        connection.release()
                    })
                }
            })
        })
    }

    private sql = 'SELECT e.snNumber sn, b.encoding, b.streamUrl, b.username, b.`password`, gl.report_time `time`, b.serial , c.ip ' +
        'FROM  b_camera_list c, b_channels b, edge_gateway e, b_gateway_list gl ' +
        'WHERE c.productKey = e.productKey AND c.gateway_id = e.deviceName AND gl.productKey = e.productKey AND gl.gateway_id = e.deviceName AND c.id = b.cid AND c.id = ? and b.serial = ?'

    async handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): Promise<boolean> {
        if (command && command instanceof PlayRequest) {

            let ipc = command.ipc;
            let channel = command.channel;
            let streamChannelId = Guid.raw();
            let index = ipc.indexOf('-');
            if (index > -1) { //for UT without dabase
                let hostConn = this.getHostConnection(ipc);
                if (hostConn) {

                    //name the connection
                    context.setName(`STREAM PLAYER:${streamChannelId}`);

                    //get the playRespone and send to player 
                    let response = this.getPlayRespone(command, true, streamChannelId)
                    connection.send(JSON.stringify(response));

                    //send startStreamRequest to host
                    let startStreamingRequest = this.getStartStreamingRequest(command, streamChannelId);

                    logger.debug(`send message:${JSON.stringify(startStreamingRequest)}`);
                    hostConn.send(JSON.stringify(startStreamingRequest));

                } else {
                    this.sendFailResponseAndCloseConnection(connection, command, "invalid ipc id or gateway is not online");
                }
                return new Promise((resolve) => { resolve(false); });
            } else { //read from sqldatabase
                try {
                    let rtsp = await this.getRtspInfo(ipc, channel);
                    let hostConn = Context.getNamedWebSocket(`HOST:${rtsp.hostId}`);
                    if (hostConn) {
                        if (hostConn.readyState !== WebSocket.OPEN) {
                            this.sendFailResponseAndCloseConnection(connection, command, "invalid ipc id or gateway is not online");
                        }
                        let startStreamingRequest = this.getStartStreamingRequest2(command, streamChannelId, rtsp);
                        logger.debug(`send message:${JSON.stringify(startStreamingRequest)}`);
                        hostConn.send(JSON.stringify(startStreamingRequest));

                    } else {
                        this.sendFailResponseAndCloseConnection(connection, command, "invalid ipc id or gateway is not online");
                    }
                    return new Promise((resolve) => { resolve(false); });
                } catch (e) {
                    logger.error(`fail to get rtsp info e:${e}`)
                    //close player connection
                    this.sendFailResponseAndCloseConnection(connection, command, "invalid ipc id or gateway is not online");
                    return new Promise((resolve) => { resolve(false); });
                }
            }
        }
        return new Promise((resolve) => { resolve(true); });
    }



    getHostConnection(ipc: string, ): WebSocket | undefined {

        //check ipc name, if not valid return undefined.

        //in this demo the ipc use {host}-{ipcname}
        let hostName = ipc.split("-")[0];
        let conn = Context.getNamedWebSocket(`HOST:${hostName}`);
        if (conn) {
            if (conn.readyState === WebSocket.OPEN) {
                return conn;
            }
            return undefined;
        }
        return undefined;
    }

    getPlayRespone(command: PlayRequest, success: boolean, streamChannel = "", reason = ""): PlayResponse {
        let response = new PlayResponse();
        response.msgId = command.msgId;
        response.version = command.version;
        response.success = success;
        response.result = reason;
        response.streamChannel = streamChannel;
        return response;
    }

    sendFailResponseAndCloseConnection(playConn: WebSocket, command: PlayRequest, reason = ""): void {
        let response = new PlayResponse();
        response.msgId = command.msgId;
        response.version = command.version;
        response.success = false;
        response.result = reason;
        response.streamChannel = "";
        playConn.send(JSON.stringify(response));
        playConn.close(1008, reason);
    }

    getStartStreamingRequest(command: PlayRequest, streamChannel: string): StartStreamingRequest {
        let request = new StartStreamingRequest();
        request.msgId = command.msgId;
        request.version = command.version;
        request.src = SrcType.Signal;

        request.streamChannel = streamChannel; //created stream channel

        request.encoding = command.encoding;
        request.channel = command.channel;
        request.duration = command.duration;

        //dummy data fill
        request.rtspAddress = "rtsp://xxxx";
        request.userName = "dummyUser";
        request.password = "dummyPassword";
        request.rtspEncoding = EncodingType.H264;
        request.turnServer = "turn://";
        request.turnUser = "turnUser";
        request.turnPassword = "turnPassword";

        return request;
    }

    getStartStreamingRequest2(command: PlayRequest, streamChannel: string, rtsp: RtspInfo): StartStreamingRequest {
        let request = new StartStreamingRequest();
        request.msgId = command.msgId;
        request.version = command.version;
        request.src = SrcType.Signal;

        request.streamChannel = streamChannel; //created stream channel

        request.encoding = command.encoding;
        request.channel = command.channel;
        request.duration = command.duration;

        //dummy data fill
        request.rtspAddress = rtsp.rtspAddress;
        request.userName = rtsp.user;
        request.password = rtsp.password;
        switch (rtsp.encoding) {
            case "H264":
                request.rtspEncoding = EncodingType.H264;
                break;
            case "H265":
                request.rtspEncoding = EncodingType.H265;
                break;
            default:
                request.rtspEncoding = EncodingType.H264;
        }
        request.ip = rtsp.ip;
        request.turnServer = TURN_SERVER!;
        request.turnUser = TURN_USER!;
        request.turnPassword = TURN_PASSWORD!;

        return request;
    }


    getCommandMeta(): [string, typeof CommandBase] {
        return ["playReq", PlayRequest];
    }

    async getRtspInfo(ipc: string, channel: number): Promise<RtspInfo> {
        logger.debug(`trying to get ipc information ipc:${ipc} channel:${channel}`);
        let sqlResult: any;
        sqlResult = await this.query(this.sql, ipc, channel);
        if (sqlResult && sqlResult.length > 0) {
            let rtsp = new RtspInfo();
            rtsp.hostId = sqlResult[0].sn;
            rtsp.rtspAddress = sqlResult[0].streamUrl;
            rtsp.user = sqlResult[0].username;
            rtsp.password = sqlResult[0].password;
            rtsp.encoding = sqlResult[0].encoding;
            rtsp.ip = sqlResult[0].ip;
            logger.debug(JSON.stringify(rtsp));
            return new Promise((resolve) => { resolve(rtsp); });

        } else {
            throw new Error("unable to find ipc infomation");
        }
    }


}

class RtspInfo {
    hostId: string = ""
    rtspAddress: string = ""
    user: string = ""
    password: string = ""
    encoding: string = "h264"
    ip: string = ""
}

class StartStreamingHandler implements CommandHandler {

    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): Promise<boolean> {
        if (command && command instanceof StartStreamingResponse) {
            if (command.success) {
                //host start streaming ok , do nothing , wait for streamer to connect
            } else {
                let streamChannel = command.streamChannel;
                //notify the player and close player's connection
                let playerConn = Context.getNamedWebSocket(`STREAM PLAYER:${streamChannel}`);
                if (playerConn && playerConn.readyState === WebSocket.OPEN) {

                    let playRsp = this.getPlayRespone(command, false, streamChannel, "host unable to serve streaming");
                    playerConn.send(JSON.stringify(playRsp));
                    playerConn.close(1008, "host unable to serve streaming");
                }
            }
            return new Promise((resolve) => { resolve(false); });
        }
        return new Promise((resolve) => { resolve(true); });
    }

    getPlayRespone(command: CommandBase, success: boolean, streamChannel = "", reason = ""): PlayResponse {
        let response = new PlayResponse();
        response.msgId = command.msgId;
        response.version = command.version;
        response.success = success;
        response.result = reason;
        response.streamChannel = streamChannel;
        return response;
    }


    getCommandMeta(): [string, typeof CommandBase] {
        return ["startStreamingRsp", StartStreamingResponse]
    }
}





export { PlayHandler, PlayRequest, StartStreamingHandler }
