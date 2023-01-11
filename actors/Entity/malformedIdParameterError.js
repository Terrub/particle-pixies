import { CustomError } from "../../errors/customError.js";

export class MalformedIdParameterError extends CustomError {
  constructor(providedId) {
    super(`Entity ID must be integer or non-empty string, received: ${providedId}`);
  }
}