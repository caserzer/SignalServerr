import { CommandRequest, SrcType } from "../src/models/Command"
import { JsonConvert } from "json2typescript";
import { HostConnectRequest } from "../src/handler/HostConnectHandler";

describe('Serialization & Deserialization Test', function () {

    it('Serialize CommandRequest', function () {
        let request: CommandRequest = { msgId: 10, src: SrcType.Host, version: 1.0, command: "hellotheworld" };

        let json = JSON.stringify(request);
        let object = JSON.parse(json);

        expect(object.msgId).toBe(10);
        expect(object.src).toBe("host");
        expect(object.version).toBe(1.0);
        expect(object.command).toBe("hellotheworld");
    })

    it("Deserialization CommandRequest", function () {
        const jsonStr = '{"msgId":100, "command":"hellotheworld", "src":"host","version":1.0}';
        let jsonObject = JSON.parse(jsonStr);
        let jsonConvert: JsonConvert = new JsonConvert();
        // jsonConvert.operationMode = OperationMode.LOGGING; // print some debug data
        // jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        // jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; //
        let cmdReq: CommandRequest = jsonConvert.deserializeObject(jsonObject, CommandRequest);
        expect(cmdReq.msgId).toBe(100);
        expect(cmdReq.src).toEqual(SrcType.Host);
        expect(cmdReq.version).toBe(1.0);
        expect(cmdReq.command).toBe("hellotheworld");

    })

    it("Deserialization CommandRequest Dynamic Type", function () {
        const jsonStr = '{"msgId":100, "command":"hellotheworld", "src":"host","version":1.0}';
        let jsonObject = JSON.parse(jsonStr);
        let jsonConvert: JsonConvert = new JsonConvert();
        // jsonConvert.operationMode = OperationMode.LOGGING; // print some debug data
        // jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        // jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; //
        let type = CommandRequest;
        let cmdReq: CommandRequest = jsonConvert.deserializeObject(jsonObject, type);
        expect(cmdReq.msgId).toBe(100);
        expect(cmdReq.src).toEqual(SrcType.Host);
        expect(cmdReq.version).toBe(1.0);
        expect(cmdReq.command).toBe("hellotheworld");

    })


    it("just debugging tools", function () {

        // try {
        //     let msg = '{"msgId":100, "command":"hostConnectReq","hostId1":"CLIENT1", "src":"host","version":1.0}';
        //     let jsonObj = JSON.parse(msg);// test if the messge is json format
        //     let commandStr = jsonObj.command; //test if the json object is CommandBase
        //     if (commandStr === undefined) {
        //         console.log("not found");
        //     }
        //     let commandType = HostConnectRequest;

        //     // let commandType = this.commandMetaMap.get(commandStr); //get relative Type
        //      let jsonConvert: JsonConvert = new JsonConvert(); //deserialize to the type
        //      let commandObject = jsonConvert.deserializeObject(jsonObj, commandType);
        // } catch (e) {
        //     if (e instanceof SyntaxError) { //not json
        //         console.log(e);
        //     }
        // }

    })



})

