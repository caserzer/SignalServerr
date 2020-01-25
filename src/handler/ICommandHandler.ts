import { Context } from "../models/Context";
import { CommandBase } from "../models/Command";
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
    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): boolean;

    /**
     * 
     * @returns command meta 
     */
    getCommandMeta(): [string, typeof CommandBase];

}


class CommandChain {

    private customerChain: CommandHandler[];

    private myMap: WeakMap<WebSocket, string> = new WeakMap<WebSocket, string>();

    private commandMetaMap = new Map<string, typeof CommandBase>();

    private GetCommand(msg: string): CommandBase | undefined {

        try {
            let jsonObj = JSON.parse(msg);// test if the messge is json format
            let commandStr = jsonObj.command; //test if the json object is CommandBase
            if (commandStr === undefined) {
                return undefined; //do not have "command" property
            }

            let commandType = this.commandMetaMap.get(commandStr); //get relative Type
            if (commandType) {
                let jsonConvert: JsonConvert = new JsonConvert(); //deserialize to the type
                return jsonConvert.deserializeObject(jsonObj, commandType);
            }
            return undefined;
        } catch (e) {
            if (e instanceof SyntaxError) {
                //not json
            } else {
                logger.error(`failed to deserialize json.${(e as Error).message}`);
            }
            return undefined;
        } 
    }

    constructor(server: WebSocket.Server) {
        this.customerChain = [];
        server.on("connection", (ws: WebSocket) => {

            this.myMap.set(ws, "hellotheworld");


            ws.on("message", (message: string) => {

                logger.debug(`received message:${message}`);


                let commandObject = this.GetCommand(message);
                for (let x of this.customerChain) {
                    let shouldContinue = x.handle(ws, new Context(), commandObject, message);
                    if (!shouldContinue) {
                        break;
                    }
                }


            });

            ws.on("close", (code: number, reason: string) => {

                logger.info(`is this correct? ${this.myMap.get(ws)}`);
                logger.info(`connection closed. status:${ws.readyState} code:${code} reason:${reason}`);
            });
        });
    }

    public AddHandler(handler: CommandHandler): void {
        let commandMeta = handler.getCommandMeta();
        if (commandMeta) {
            this.commandMetaMap.set(commandMeta[0], commandMeta[1]);
        }
        this.customerChain.push(handler);
    }

}

export { CommandHandler, CommandChain }
