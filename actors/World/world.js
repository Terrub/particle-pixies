import { MissingParameterError } from "../../errors/missingParameterError.js";
import { DuplicateEntityIdError } from "./duplicateEntityIdError.js";
import { Utils } from "../../utils.js";

export class World {
  renderer;

  entities = [];

  entityMap = {};

  entityPositions = {};

  particleSize = 3;

  constructor(renderer, config) {
    if (Utils.isUndefined(renderer)) {
      throw new MissingParameterError("renderer");
    }
    this.renderer = renderer;

    if (Utils.isDefined(config)) {
      if ("particleSize" in config) {
        this.particleSize = config["particleSize"];
      }
    }
  }

  getColorByEntityType(type) {
    return "red";
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

  render() {
    for (const entity of this.entities) {
      const position = this.entityPositions[entity.id];
      this.renderer.drawCircle(
        position.x,
        position.y,
        this.particleSize,
        this.getColorByEntityType(entity.type)
      );
    }
  }
}
