import { Context } from "../models/Context";
import { CommandBase, CommandRequest, CommandResponse } from "../models/Command";
import WebSocket = require("ws");
import { CommandHandler } from "./ICommandHandler";
import { JsonObject, JsonProperty } from "json2typescript";
import logger from "../util/logger";
import { Guid } from "guid-typescript";


@JsonObject("streamReq")
class StreamRequest extends CommandRequest {

    @JsonProperty("streamChannel", String)
    streamChannel: string = "";

    constructor() {
        super();
        this.command = "streamReq";
    }
}

@JsonObject("streamRsp")
class StreamResponse extends CommandResponse {

    constructor() {
        super();
        this.command = "streamRsp";
    }

}

class StreamHandler implements CommandHandler {

    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): boolean {
        if (command && command instanceof StreamRequest) {
            let streamChannel = command.streamChannel;

            //check sanity
            if (!Guid.isGuid(streamChannel)) {
                logger.error(`recevied streamer connection with invalid streamChannel.message:${rawString}`);
                connection.send(JSON.stringify(this.getResponse(command, "invalid streamChannel")));
                connection.close(1008, "invalid streamChannel");
            }

            let pairedConnectionName = `STREAM PLAYER:${streamChannel}`;
            let pairedConn = Context.getNamedWebSocket(pairedConnectionName);
            if (pairedConn && pairedConn.readyState === WebSocket.OPEN) {
                //set name
                context.setName(`STREAM STREAMER:${streamChannel}`);

                //close paired connction
                connection.on("close", () => {
                    if (pairedConn && pairedConn.readyState === WebSocket.OPEN) {
                        logger.info(`close paired connection,message channel:${streamChannel}`);
                        pairedConn.close(1008, "pair close");
                    }
                });
                pairedConn.on("close", () => {
                    if (connection && connection.readyState === WebSocket.OPEN) {
                        logger.info(`close paired connection,message channel:${streamChannel}`);
                        connection.close(1008, "pair close");
                    }
                });

            } else {
                logger.error(`recevied streamer connection but player connection is not valid.message:${rawString}`);
                connection.send(JSON.stringify(this.getResponse(command, "invalid streamChannel")));
                connection.close(1008, "invalid streamChannel");
            }

            return false;
        }

        return true;
    }

    getResponse(command: StreamRequest, reason = ''): StreamResponse {
        let response = new StreamResponse();
        response.msgId = command.msgId;
        response.version = command.version;
        response.success = false;
        response.result = reason;
        return response;
    }

    getCommandMeta(): [string, typeof CommandBase] {
        return ["streamReq", StreamRequest];
    }

}

class SDPHandler implements CommandHandler {

    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): boolean {
        if (context.getName()?.includes("STREAM")) {
            let name = context.getName()
            let pairedConn = this.getPairedConnection(name!);
            if (pairedConn && pairedConn.readyState === WebSocket.OPEN) {
                pairedConn.send(rawString);
                logger.debug(`REPLAY message to paired connection from named connection:${name}.message:${rawString}`);
            }
            return false;
        }
        return true;
    }

    getCommandMeta(): [string, typeof CommandBase] {
        return ["THIS will never happen", CommandBase]
    }

    getPairedConnection(connName: string): WebSocket | undefined {
        let streamChannel = connName.split(':')[1];
        let targetConnection = '';
        if (connName.includes('STREAM PLAYER:')) {
            targetConnection = 'STREAM STREAMER:';
        }
        if (connName.includes('STREAM STREAMER:')) {
            targetConnection = 'STREAM PLAYER:';
        }
        targetConnection += streamChannel;
        return Context.getNamedWebSocket(targetConnection);
    }


}

class UnRecognizedCommandHandler implements CommandHandler {
    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): boolean {
        logger.error(`received unrecognized command. command text:${rawString}. close connection.`);
        connection.terminate();
        return true;
    }

    getCommandMeta(): [string, typeof CommandBase] {
        return ["THIS will never happen", CommandBase];
    }


}



export { StreamHandler, SDPHandler , UnRecognizedCommandHandler}
