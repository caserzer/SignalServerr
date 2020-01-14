import { CommandRequest, CommandResponse, SrcType, getEnumKeyByEnumValue} from "../src/models/Command"
import { JsonConvert , OperationMode, ValueCheckingMode, Any} from "json2typescript";

describe('Serialization & Deserialization Test', function () {
    
    it('Serialize CommandRequest', function () {
        let request : CommandRequest = { msgId: 10 , src : SrcType.Host, version:1.0, command:"hellotheworld" };

        let json = JSON.stringify(request);
        let object = JSON.parse(json);
        
        expect(object.msgId).toBe(10);
        expect(object.src).toBe("host");
        expect(object.version).toBe(1.0);
        expect(object.command).toBe("hellotheworld");
    })

    it("Deserialization CommandRequest", function(){
        const jsonStr = '{"msgId":100, "command":"hellotheworld", "src":"host","version":1.0}';
        let jsonObject = JSON.parse(jsonStr);
        let jsonConvert : JsonConvert = new JsonConvert();
        // jsonConvert.operationMode = OperationMode.LOGGING; // print some debug data
        // jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        // jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; //
        let cmdReq : CommandRequest = jsonConvert.deserializeObject(jsonObject,CommandRequest);
        expect(cmdReq.msgId).toBe(100);
        expect(cmdReq.src).toEqual(SrcType.Host);
        expect(cmdReq.version).toBe(1.0);
        expect(cmdReq.command).toBe("hellotheworld");

    })


    it("just debugging tools", function(){

        let x  = getEnumKeyByEnumValue(SrcType,"host");
        let y = typeof SrcType.Host;
        console.log(x,y);
    })



})

