import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject("TurnServer")
class TurnServer {

    @JsonProperty("serverAddress", String)
    serverAddress: string = "";

    @JsonProperty("user", String)
    user: string = "";

    @JsonProperty("password", String)
    password: string = "";

}

export { TurnServer }