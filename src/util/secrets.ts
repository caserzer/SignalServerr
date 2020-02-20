import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";
import {TurnServer} from "../models/TurnServer"

let stunServers: string[] = [];
let turnServers: TurnServer[] = [];
if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });

    //load stun server configuration
    let stunServersStr: string = process.env["STUN"]!;
    let stunServerObjects = JSON.parse(stunServersStr);
    for (let ss of stunServerObjects.servers) {
        stunServers.push(ss);
    }

    //load turn server configuration
    let turnServersStr : string = process.env["TURN"]!;
    let turnServersObject = JSON.parse(turnServersStr);
    for(let ts of turnServersObject.servers){
        let item = new TurnServer;
        item.serverAddress = ts.serverAddress;
        item.user = ts.user;
        item.password = ts.password;
        turnServers.push(item);
    }


} else {
    logger.error("unable to find  .env file to supply config environment variables");
    process.exit(1);
}

export const MYSQL_HOST = process.env["MYSQL_HOST"];
export const MYSQL_USER = process.env["MYSQL_USER"];
export const MYSQL_PASSWORD = process.env["MYSQL_PASSWORD"];
export const MYSQL_DATABASE = process.env["MYSQL_DATABASE"];
export const MYSQL_PORT = process.env["MYSQL_PORT"];
export const APP_PORT = process.env["APP_PORT"];
export const MYSQL_CERTFILE = process.env["MYSQL_CERTFILE"];
export const STUN_SERVERS = stunServers;
export const TURN_SERVERS = turnServers;

if (!MYSQL_HOST || !MYSQL_USER ||
    !MYSQL_PASSWORD || !MYSQL_DATABASE || !MYSQL_PORT || !APP_PORT ||
    !MYSQL_CERTFILE
) {
    logger.error("insufficient configuration provided");
    process.exit(1);
}
