import { CommandRequest, CommandResponse, SrcType} from "../src/models/Command"


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


})

