import { Context } from "../models/Context";
import { CommandBase, CommandRequest, CommandResponse } from "../models/Command";
import WebSocket = require("ws");
import { CommandHandler } from "./ICommandHandler";
import { JsonObject, JsonProperty } from "json2typescript";


@JsonObject("hostConnectReq")
class HostConnectRequest extends CommandRequest {

    @JsonProperty("hostId", String)
    hostId: string = "";

    constructor() {
        super();
        this.command = "hostConnectReq";
    }
}

@JsonObject("hostConnectRsp")
class HostConnectResponse extends CommandResponse {

    constructor() {
        super();
        this.command = "hostConnectRsp";
    }

}

class HostConnectHandler implements CommandHandler {

    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): Promise<boolean> {
        if (command && command instanceof HostConnectRequest) {
            let hostId = command.hostId;
            if (this.checkSameHostIdConnectionExist(hostId)) {
                //相同hostId,并且原来的链接是open 的状态，关闭当前连接
                this.logSuspiciousConnection(connection, rawString);
                let rsp = this.createResponse(command, false, "duplicated hostId");
                connection.send(JSON.stringify(rsp));
                connection.close(1008, "duplicated hostId");
                return new Promise((resolve) => { resolve(false); });;
            }

            //handle host open command.
            let successRsp = this.createResponse(command, true);
            connection.send(JSON.stringify(successRsp));
            context.setName(`HOST:${hostId}`);
            return new Promise((resolve) => { resolve(false); });;
        }
        return new Promise((resolve) => { resolve(true); });;
    }

    getCommandMeta(): [string, typeof CommandBase] {
        return ["hostConnectReq", HostConnectRequest];
    }


    /**
     * 检查相同hostId 的connection 是否存在
     * @param hostId 
     * @returns true if same host id connection exist 
     */
    checkSameHostIdConnectionExist(hostId: string): boolean {
        let conn = Context.getNamedWebSocket(`HOST:${hostId}`);
        if (conn && conn.readyState === WebSocket.OPEN) {
            return true;
        }
        return false;
    }


    /**
     * 检查hostId 是否是合法的hostId 
     * @param hostId 
     * @returns true if host id 
     */
    checkHostId(hostId: string): boolean {
        return true;
    }

    logSuspiciousConnection(connection: WebSocket, rawString: string): void {
        //log remote ip , rawstring , datetime etc.
    }

    createResponse(req: HostConnectRequest, success: boolean, result = ""): HostConnectResponse {
        let response = new HostConnectResponse();
        response.msgId = req.msgId;
        response.success = success;
        response.result = result;
        return response;
    }

}



export { HostConnectHandler, HostConnectRequest }
