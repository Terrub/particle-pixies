import { CustomError } from "../../errors/customError.js";

export class DuplicateEntityIdError extends CustomError {
  constructor(duplicatedId) {
    super(`Duplicate entity id found: '${duplicatedId}'`);
  }
}
