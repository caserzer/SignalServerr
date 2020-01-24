import WebSocket = require("ws");

class Context {

    name ? : string;

    openTime ? : Date;

    closeTime ? : Date;

    logs  : string []  = [];

    public appendLog(msg:string):void{
        this.logs.push(msg);
    }
}

export {Context}
