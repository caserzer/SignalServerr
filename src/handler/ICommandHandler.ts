import { Context } from "../models/Context";
import { CommandBase, HostConnectRequest } from "../models/Command";
import WebSocket = require("ws");
import logger from "../util/logger";
import { JsonConvert } from "json2typescript";



/**
 * Command Handler
 */
interface CommandHandler {

    /**
     * Handle Websocket Messag
     * @param connection connection information
     * @param context context for the connection 
     * @param command CommandBase if the command can be deserialized to CommandBase classes
     * @param rawString raw string of the command
     * @returns true if the command chain need to continue
     */
    handle(connection : WebSocket , context: Context, command : CommandBase, rawString:string):boolean;

    /**
     * 
     * @returns command meta 
     */
    getCommandMeta():[string, typeof CommandBase];
    
}


class HostConnectHandler implements CommandHandler{
    
    handle(connection: WebSocket, context: Context, command: CommandBase, rawString: string): boolean {
        if(command && command instanceof HostConnectRequest){
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

class CommandChain {

    private customerChain : CommandHandler[] ;

    private myMap : WeakMap<WebSocket,string> =  new WeakMap< WebSocket,string>();

    private commandMetaMap  = new Map<string, typeof CommandBase>();

    constructor(server: WebSocket.Server){
        this.customerChain = [];
        server.on("connection", (ws:WebSocket)=>{
            
            this.myMap.set(ws,"hellotheworld");


            ws.on("message", (message:string)=>{

                try{
                    let jsonObj = JSON.parse(message);
                    let commandStr = jsonObj.command;
                    let commandType = this.commandMetaMap.get(commandStr);
                    let jsonConvert : JsonConvert = new JsonConvert();
                    let commandObject = jsonConvert.deserializeObject(jsonObj,commandType!);
                    for( let x  of this.customerChain){
                        let shouldContinue = x.handle(ws, new Context(), commandObject,message);
                        if(!shouldContinue){
                            break;
                        }
                    }
                }catch(e){
                    // console.log(e);
                    logger.error(e);

                }
                ws.send('message received.');

            });



            ws.on("close", (code: number, reason: string)=>{

                logger.info(`is this correct? ${this.myMap.get(ws)}`);
                logger.info(`connection closed. status:${ws.readyState} code:${code} reason:${reason}`);
            });
        });
    }

    public AddHandler(handler: CommandHandler):void {
        let commandMeta = handler.getCommandMeta();
        if(commandMeta){
            this.commandMetaMap.set(commandMeta[0],commandMeta[1]);
        }
        this.customerChain.push(handler);
    }

}

export{ CommandHandler, CommandChain, HostConnectHandler}
