import { JsonConverter, JsonCustomConvert } from "json2typescript";
import { SrcType } from "./Command";


@JsonConverter
export class EnumConverter<T> implements JsonCustomConvert<any> {
  enumType: {[key: string]: any};

  constructor(enumType: {[key: string]: any}) {
    this.enumType = enumType;
  }

  serialize(data: any): any {
    if (!data) {
      return null;
    }
    return data.toString(); // Return as a number if that is desired
  }


  /**
   * Deserializes enum converter
   * @param data 
   * @returns deserialize 
   * //TODO: refine the logic , seems to be a problem
   */
  deserialize(data: any): T | undefined{
    if (data === undefined || data == null) {
      return undefined;
    }
    for (const property of Object.keys(this.enumType)) {
      if (property.toUpperCase() === String(data).toUpperCase()) {
        const enumMember = this.enumType[property];
        if (typeof enumMember === 'string') {
          let result = <T>this.enumType[<string>property];
          return result;
        }
      }
    }
    return undefined;
  }
}

export class SrcTypeConvert extends  EnumConverter<SrcType>{
  constructor(){
    super(SrcType);
  }
}