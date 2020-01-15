import { CommandRequest, CommandResponse, SrcType, getEnumKeyByEnumValue} from "../src/models/Command"
import { SrcTypeConvert } from "../src/models/EnumConvert"
import { JsonConvert , OperationMode, ValueCheckingMode, Any, JsonProperty, JsonConverter} from "json2typescript";

class SrcTypeTest{
    @JsonProperty("src", SrcTypeConvert)
    src?: SrcType | null = undefined ;
}

describe('Enum Serialization Test', function () {
    
    it('Serialize SrcType', function () {
        let testObject : SrcTypeTest = { src:SrcType.Host};
        let json = JSON.stringify(testObject);
        let jObject = JSON.parse(json);
        expect(jObject.src).toBe(SrcType.Host);

    })

    it('Deserialize SrcType', function () {
        let json = '{ "src":"signal"}';
        let jObject = JSON.parse(json);
        let jsonConverter = new JsonConvert();
        let typeObject : SrcTypeTest = jsonConverter.deserializeObject(jObject,SrcTypeTest);
        expect(typeObject.src).toBe(SrcType.Signal);

    })

    it('Deserialize SrcType 1', function () {
        let json = '{ "src":"host"}';
        let jObject = JSON.parse(json);
        let jsonConverter = new JsonConvert();
        let typeObject : SrcTypeTest = jsonConverter.deserializeObject(jObject,SrcTypeTest);
        expect(typeObject.src).toBe(SrcType.Host);

    })

    it('Deserialize SrcType 2', function () {
        let json = '{ "src":"player"}';
        let jObject = JSON.parse(json);
        let jsonConverter = new JsonConvert();
        let typeObject : SrcTypeTest = jsonConverter.deserializeObject(jObject,SrcTypeTest);
        expect(typeObject.src).toBe(SrcType.Player);

    })

    it('Deserialize SrcType 3', function () {
        let json = '{ "src":"streamer"}';
        let jObject = JSON.parse(json);
        let jsonConverter = new JsonConvert();
        let typeObject : SrcTypeTest = jsonConverter.deserializeObject(jObject,SrcTypeTest);
        expect(typeObject.src).toBe(SrcType.Streamer);

    })

    it('Deserialize SrcType Undefined', function () {
        let json = '{ "src":"hostXXXX"}';
        let jObject = JSON.parse(json);
        let jsonConverter = new JsonConvert();
        let typeObject : SrcTypeTest = jsonConverter.deserializeObject(jObject,SrcTypeTest);
        expect(typeObject.src).toBe(undefined);

    })


})

