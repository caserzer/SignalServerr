import { Context } from "../models/Context";
import { CommandBase, CommandRequest, CommandResponse } from "../models/Command";
import WebSocket = require("ws");
import { CommandHandler } from "./ICommandHandler";
import { JsonObject, JsonProperty } from "json2typescript";


@JsonObject("hostConnectReq")
class HostConnectRequest extends CommandRequest{

    @JsonProperty("hostId",String)
    HostId:string = "";

    constructor(){
        super();
        this.command= "hostConnectReq";
    }
}

@JsonObject("hostConnectRsp")
class HostConnectResponse extends CommandResponse {
    
}

class HostConnectHandler implements CommandHandler {
    handle(connection: WebSocket, context: Context, command: CommandBase, rawString: string): boolean {
        if (command && command instanceof HostConnectRequest) {
            //handle host open command.
            connection.send("hello open command");
            return false;
        }
        return true;
    }
    getCommandMeta(): [string, typeof CommandBase] {
        return ["hostConnectReq", HostConnectRequest];
    }
}



export { HostConnectHandler }
