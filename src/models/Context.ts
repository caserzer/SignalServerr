import WebSocket = require("ws");

import weak from 'weak-napi'


class Context {

    private name ? : string;

    private connectedTime : Date = new Date();

    public getConnectedTime() : Date{
        return this.connectedTime;
    }

    weakRefWebSocket:any ;

    private static namedContext : Map<string, Context> = new Map<string,Context>();
    private static webSocketMap : WeakMap<WebSocket,Context> = new WeakMap<WebSocket,Context>();
    private static _initial = (()=>{
        //clear resources timely.
    })();

    public setWebSocket(conn:WebSocket):void{
        this.weakRefWebSocket = weak(conn,()=>{});
        Context.webSocketMap.set(conn,this);
    }

    public getName():string|undefined{
        if(this.name){
            return this.name;
        }
        return undefined;
    }

    public setName(name:string){
        if( !this.weakRefWebSocket){
            throw new Error("can't set named websocket before setWebSocket");
        }
        this.name = name;
        Context.namedContext.set(name,this);
    }

    public getWebSocket() : WebSocket | undefined {
        if(! this.weakRefWebSocket){
            return undefined;
        }
        return weak.get<WebSocket>(this.weakRefWebSocket);
    }

    public static getNamedWebSocket(name:string):WebSocket | undefined{
        let namedContext = Context.namedContext.get(name)
        if(! namedContext){
            return undefined;
        }
        return namedContext.getWebSocket();
    }

    public static getContext(conn: WebSocket) : Context | undefined {
        return Context.webSocketMap.get(conn);
    }

    private static server : WebSocket.Server;

    public static setServer(server:WebSocket.Server):void{
        this.server = server;
    }

    public static getServer(): WebSocket.Server{
        return this.server;
    }

}

export {Context}
