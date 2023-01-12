import { CustomError } from "../../errors/customError.js";

export class MalformedTypeParameterError extends CustomError {
  constructor(providedType) {
    super(`Entity type must be integer (0,5), received: ${providedType}`);
  }
}