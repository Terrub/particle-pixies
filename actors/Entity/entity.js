import { Utils } from "../../utils.js";
import { MalformedIdParameterError } from "./malformedIdParameterError.js";

export class Entity {
  static TYPE_ONE = 1;

  id;

  constructor(id) {
    if ((!Utils.isString(id) && !Utils.isInteger(id)) || id === "") {
      throw new MalformedIdParameterError(id);
    }

    this.id = id;
  }

  get type() {
    return Entity.TYPE_ONE;
  }
}
