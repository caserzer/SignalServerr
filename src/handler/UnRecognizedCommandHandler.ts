import { CommandHandler } from "./ICommandHandler";
import { Context } from "../models/Context";
import { CommandBase } from "../models/Command";
import WebSocket = require("ws");
import logger from "../util/logger";


class UnRecognizedCommandHandler implements CommandHandler {
    

    
    handle(connection: WebSocket, context: Context, command: CommandBase | undefined, rawString: string): Promise<boolean> {


        logger.error(`received unrecognized command. command text:${rawString}. close connection.`);
        connection.terminate();
        return new Promise((resolve) => {resolve(true);});

    }

    getCommandMeta(): [string, typeof CommandBase] {
        return ["THIS will never happen", CommandBase];
    }


}

export {UnRecognizedCommandHandler}