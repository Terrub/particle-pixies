import { MissingParameterError } from "../../errors/missingParameterError.js";
import { DuplicateEntityIdError } from "./duplicateEntityIdError.js";
import { Utils } from "../../utils.js";

export class World {
  renderer;

  entities = [];

  entityMap = {};

  entityPositions = {};

  constructor(renderer) {
    if (Utils.isUndefined(renderer)) {
      throw new MissingParameterError("renderer");
    }
    this.renderer = renderer;
  }

  getColorByEntityType(type) {
    return "red";
  }

  updateEntities() {
    this.entities.forEach((entity) => {
      const position = this.entityPositions[entity.id];
      this.renderer.drawCircle(
        position.x,
        position.y,
        5,
        this.getColorByEntityType(entity.type)
      );
    });
  }

  addEntityAt(entity, position) {
    if (entity.id in this.entityMap) {
      throw new DuplicateEntityIdError(entity.id);
    }

    this.entityPositions[entity.id] = position;
    // TODO: Consider better storage of entity index map
    this.entityMap[entity.id] = this.entities.length;
    this.entities.push(entity);
  }

  getEntityPosition(entity) {
    return this.entityPositions[entity.id];
  }
}
