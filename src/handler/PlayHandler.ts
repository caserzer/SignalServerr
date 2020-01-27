import { Context } from "../models/Context";
import { CommandBase, CommandRequest, CommandResponse, SrcType } from "../models/Command";
import WebSocket = require("ws");
import { CommandHandler } from "./ICommandHandler";
import { JsonObject, JsonProperty } from "json2typescript";
import { EnumConverter } from "../models/EnumConvert";
import { Guid } from "guid-typescript"
import logger from "../util/logger";


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


    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): boolean {
        if (command && command instanceof PlayRequest) {

            let ipc = command.ipc;
            let hostConn = this.getHostConnection(ipc);
            if (hostConn) {
                let streamChannelId = Guid.raw();

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
                //send failed playResponse
                //close the connection
                let failedResponse = this.getPlayRespone(command, false, "invalid ipc id or gateway is not online");
                connection.send(JSON.stringify(failedResponse));
                connection.close(1008, "invalid ipc id or gateway is not online");
            }
            return false;
        }
        return true;
    }

    getHostConnection(ipc: string): WebSocket | undefined {

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

    getCommandMeta(): [string, typeof CommandBase] {
        return ["playReq", PlayRequest];
    }


}

class StartStreamingHandler implements CommandHandler {

    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): boolean {
        if (command && command instanceof StartStreamingResponse) {
            if (command.success) {
                //host start streaming ok , do nothing , wait for streamer to connect
            } else {
                let streamChannel = command.streamChannel;
                //notify the player and close player's connection
                let playerConn = Context.getNamedWebSocket(`STREAM PLAYER:${streamChannel}`);
                if (playerConn && playerConn.readyState === WebSocket.OPEN) {

                    let playRsp = this.getPlayRespone(command, false, streamChannel, "host unable to server");
                    playerConn.send(JSON.stringify(playRsp));
                    playerConn.close(1008, "host unable to server");
                }
            }
            return false;
        }
        return true;
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
