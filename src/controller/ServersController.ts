import { Request, Response } from 'express';
import { TurnServer } from '../models/TurnServer';
import { STUN_SERVERS, TURN_SERVERS, PASSPHRASE } from '../util/secrets';
import { AES } from 'crypto-js';


export const getServers = (req: Request, res: Response) => {
    let server = new ServerInfo();
    server.stun = STUN_SERVERS;
    server.turn = TURN_SERVERS;
    let date = new Date();
    let salt  = date.getUTCDate().toString() + date.getUTCMonth().toString() + date.getUTCDay().toString();
    let encrypted = <CryptoJS.WordArray>AES.encrypt(JSON.stringify(server), PASSPHRASE! + salt);
    res.json( new Cipher(encrypted.toString()));
};


class ServerInfo{

    stun : string [] = [];

    turn : TurnServer [] = [];
}

class Cipher{
    encrypted : string;

    constructor(encryptedString:string){
        this.encrypted = encryptedString;
    }
}