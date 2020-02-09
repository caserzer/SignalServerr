
import { Request, Response } from 'express';
import { Context } from '../models/Context';


export const getConnections = (req: Request, res: Response) => {
    let server = Context.getServer();
    let conns: ConnectionInfo[] = [];
    server.clients.forEach(function each(ws) {
        let conn = new ConnectionInfo();
        let contex = Context.getContext(ws);
        if (contex) {
            conn.name = contex.getName();
            conn.createTime = contex.getConnectedTime();
            conns.push(conn);
        }
    });
    res.json(conns);
};

class ConnectionInfo {
    name: string | undefined = "";
    createTime: Date = new Date();
}