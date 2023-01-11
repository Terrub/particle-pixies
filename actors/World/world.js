import { DuplicateEntityIdError } from "./duplicateEntityIdError.js";
import { Utils } from "../../utils.js";
import { MissingParameterError } from "../../errors/missingParameterError.js";

export class World {
  static #ACTIVE_BUFFER_ALPHA = "alpha";

  static #ACTIVE_BUFFER_BETA = "beta";

  #activeBufferFlag;

  renderer;

  entities = [];

  entityMap = {};

  positionBufferAlpha = [];

  positionBufferBeta = [];

  entityPositions;

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

    this.#activeBufferFlag = World.#ACTIVE_BUFFER_ALPHA;
    this.entityPositions = this.positionBufferAlpha;
  }

  #getCurrentWritableBuffer() {
    return this.#activeBufferFlag === World.#ACTIVE_BUFFER_ALPHA
      ? this.positionBufferBeta
      : this.positionBufferAlpha;
  }

  #swapBuffers() {
    this.#activeBufferFlag =
      this.#activeBufferFlag === World.#ACTIVE_BUFFER_ALPHA
        ? World.#ACTIVE_BUFFER_BETA
        : World.#ACTIVE_BUFFER_ALPHA;
  }

  getColorByEntityType(type) {
    return "red";
  }

  addEntityAt(entity, position) {
    if (entity.id in this.entityMap) {
      throw new DuplicateEntityIdError(entity.id);
    }

    const writablePositionBuffer = this.#getCurrentWritableBuffer();
    const entityIndex = this.entities.length;
    this.entityMap[entity.id] = entityIndex;
    this.entities[entityIndex] = entity;
    writablePositionBuffer[entityIndex] = position;
  }

  getEntityPosition(entity) {
    const entityIndex = this.entityMap[entity.id];

    return this.entityPositions[entityIndex];
  }

  resolveTic() {
    // update new position buffer with current position data
    const newPositions = this.#getCurrentWritableBuffer();
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      // const entity = this.entities[entityIndex];
      const position = this.entityPositions[entityIndex];
      newPositions[entityIndex] = position;
    }
    this.#swapBuffers();
    this.entityPositions = newPositions;
  }

  render() {
    this.renderer.clear();
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      const entity = this.entities[entityIndex];
      const position = this.entityPositions[entityIndex];

      this.renderer.drawCircle(
        position.x,
        position.y,
        this.particleSize,
        this.getColorByEntityType(entity.type)
      );
    }
  }
}
