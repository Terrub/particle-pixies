import { CustomError } from "./customError.js";

export class MissingParameterError extends CustomError {
  constructor(parameter) {
    super(`Missing constructor parameter: '${parameter}'`);
  }
}