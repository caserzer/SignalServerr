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
    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): Promise<boolean>;

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

    private interval: NodeJS.Timeout;
    constructor(server: WebSocket.Server) {

        Context.setServer(server);

        this.customerChain = [];
        server.on("connection", (ws: WebSocket) => {

            this.HandleConnectionOpen(ws);


            ws.on("message", (message: string) => {
                this.HandleMessage(ws, message);
            });

            ws.on("close", (code: number, reason: string) => {
                this.HandleConnectionClose(ws, code, reason);
            });

            ws.on("pong", () => {
                let context = Context.getContext(ws);
                if (context) {
                    context.Alive = true;
                } 
            });

        });

        this.interval = setInterval(function ping() {
            server.clients.forEach(function each(ws) {
                try {
                    let context = Context.getContext(ws);
                    if(context){
                        if(context.Alive === false) {
                            ws.terminate();// 
                            logger.info(`broken connection terminated. context name:${context.getName()}`)
                        }
                        context.Alive = false;
                        ws.ping();
                    }
                    
                } catch (e) {
                    logger.error('error when ping', e);
                }

            });
        }, 15000);
    }

    private HandleConnectionOpen(conn: WebSocket): void {
        let context = new Context();
        context.setWebSocket(conn);
    }

    private HandleMessage(conn: WebSocket, message: string): void {

        let asyncFunc = async () => {
            logger.debug(`received message. context name:${Context.getContext(conn)?.getName()} . message:${message}`);
            let commandObject = this.GetCommand(message);

            let context = Context.getContext(conn);
            if (!context) {
                logger.error("NEVER SHOULD ENTER THIS");
                return;
            }
            for (let x of this.customerChain) {
                try {

                    let shouldContinue = await x.handle(conn, context!, commandObject, message);
                    if (!shouldContinue) {
                        break;
                    }
                } catch (e) {
                    logger.error('HandleMessage ERROR:', e)
                }
            }

        }
        asyncFunc();


    }


    private HandleConnectionClose(conn: WebSocket, code?: number, reason?: string): void {
        logger.info(`connection closed. context name:${Context.getContext(conn)?.getName()} status:${conn.readyState} code:${code} reason:${reason}`);
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
