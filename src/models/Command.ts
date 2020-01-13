import { JsonObject, JsonProperty } from "json2typescript";

/**
 * 消息来源
 * Signal : Signal 服务器
 * Host : 网关监控程序
 * Player : WebRTC 播放程序，网页程序
 * Streamer : 网关串流程序
 */
enum SrcType {
    Signal = "signal",
    Host = "host",
    Player = "player",
    Streamer = "streamer",
}


/**
 * 消息基础类
 */
abstract class CommandBase{

    /**
     * 消息ID , Request / Response 需要保持一致 
     */
    @JsonProperty("msgId", Number)
    msgId: number = 0;

    /**
     * 消息版本
     */
    @JsonProperty("version", Number)
    version: number = 1.0;


    @JsonProperty("command", String)
    command: string = "";

} 


@JsonObject("request")
class CommandRequest extends CommandBase {

    @JsonProperty("src", String)
    src?: SrcType | null = undefined ;

}

@JsonObject("response")
class CommandResponse extends CommandBase {

    @JsonProperty("result", String, true)
    result?: string | null = undefined;

}

export { CommandRequest, CommandResponse, SrcType};