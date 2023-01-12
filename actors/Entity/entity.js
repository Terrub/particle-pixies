import { Utils } from "../../utils.js";
import { MalformedIdParameterError } from "./malformedIdParameterError.js";
import { MalformedTypeParameterError } from "./malformedTypeParameterError.js";

export class Entity {
  static TYPE_ZERO = 0;

  static TYPE_ONE = 1;

  static TYPE_TWO = 2;

  static TYPE_THREE = 3;

  static TYPE_FOUR = 4;

  static TYPE_FIVE = 5;

  id;

  constructor(id, type) {
    if ((!Utils.isString(id) && !Utils.isInteger(id)) || id === "") {
      throw new MalformedIdParameterError(id);
    }

    if (!Utils.isInteger(type) || type > 5 || type < 0) {
      throw new MalformedTypeParameterError(type);
    }

    this.id = id;
    this.type = type;
  }
}
