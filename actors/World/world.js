import { DuplicateEntityIdError } from "./duplicateEntityIdError.js";
import { Utils } from "../../utils.js";
import { MissingParameterError } from "../../errors/missingParameterError.js";
import { Vector } from "../vector.js";

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

  attractionMods = [
    [0.5, -1, 0.1, 0.1, 0.1, 0.1],
    [0.1, 0.5, -1, 0.1, 0.1, 0.1],
    [0.1, 0.1, 0.5, -1, 0.1, 0.1],
    [0.1, 0.1, 0.1, 0.5, -1, 0.1],
    [0.1, 0.1, 0.1, 0.1, 0.5, -1],
    [-1, 0.1, 0.1, 0.1, 0.1, 0.5],
  ];

  constructor(renderer, config) {
    if (Utils.isUndefined(renderer)) {
      throw new MissingParameterError("renderer");
    }
    this.renderer = renderer;

    if (Utils.isDefined(config)) {
      if ("particleSize" in config) {
        this.particleSize = config["particleSize"];
      }

      if ("attractionMods" in config) {
        this.attractionMods = config["attractionMods"];
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
    this.entityPositions = this.#getCurrentWritableBuffer();
    this.#activeBufferFlag =
      this.#activeBufferFlag === World.#ACTIVE_BUFFER_ALPHA
        ? World.#ACTIVE_BUFFER_BETA
        : World.#ACTIVE_BUFFER_ALPHA;
  }

  getColorByEntityType(type) {
    const colors = ["red", "orange", "yellow", "lime", "blue", "purple"];

    return colors[type];
  }

  addEntityAt(entity, position) {
    if (entity.id in this.entityMap) {
      throw new DuplicateEntityIdError(entity.id);
    }

    const writablePositionBuffer = this.#getCurrentWritableBuffer();
    const entityIndex = this.entities.length;
    this.entityMap[entity.id] = entityIndex;
    this.entities[entityIndex] = entity;
    writablePositionBuffer[entityIndex] = [position, new Vector(0, 0)];
  }

  getEntityPosition(entity) {
    const entityIndex = this.entityMap[entity.id];

    return this.getEntityPositionByIndex(entityIndex);
  }

  getModifierByDistance(distance) {
    if (distance < this.particleSize * 2) {
      return distance - this.particleSize * 2;
    }

    let modifier = 0;

    distance -= this.particleSize * 2;
    if (distance <= 25) {
      modifier = distance * 0.04;
    } else if (distance <= 50) {
      modifier = 2 - distance * 0.04;
    }

    return modifier;
  }

  getAttractionModifier(idA, idB) {
    const entityA = this.entities[idA];
    const entityB = this.entities[idB];
    const typeA = entityA.type;
    const typeB = entityB.type;

    return this.attractionMods[typeA][typeB];
  }

  getEntityPositionByIndex(entityIndex) {
    return this.entityPositions[entityIndex][0];
  }

  getEntityVelocityByIndex(entityIndex) {
    return this.entityPositions[entityIndex][1];
  }

  notCloseEnough(v1, v2) {
    if (
      v2.x < 50 ||
      v2.x > this.renderer.width - 50 ||
      v2.y < 50 ||
      v2.y > this.renderer.height - 50
    ) {
      // Too close to the edges to make sure it's not in range for now. needs work
      // TODO: Many
      return false;
    }

    if (
      v1.x + 50 < v2.x || // other is too far on our right
      v1.y + 50 < v2.y || // other is too far below us
      v1.x - 50 > v2.x || // other is too far left of us
      v1.y - 50 > v2.y // other is too far above us
    ) {
      return true;
    }

    // These are close enough it seems.
    return false;
  }

  getNewVelocity(position, skipIndex) {
    let forceVector = new Vector(0, 0);
    const curVelocity = this.getEntityVelocityByIndex(skipIndex);
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      if (entityIndex === skipIndex) {
        continue;
      }

      const otherPos = this.getEntityPositionByIndex(entityIndex);
      if (this.notCloseEnough(position, otherPos)) {
        continue;
      }

      let diffAtoB = Vector.getShortestTorusDeltaVector(
        position,
        otherPos,
        this.renderer.width,
        this.renderer.height
      );
      let modifier = this.getModifierByDistance(diffAtoB.length());
      if (modifier > 0) {
        modifier *= this.getAttractionModifier(skipIndex, entityIndex);
      }

      forceVector = Vector.add(forceVector, diffAtoB.scale(modifier));
    }

    return Vector.add(this.getEntityVelocityByIndex(skipIndex), forceVector);
  }

  wrap(vector) {
    vector.x = (this.renderer.width + vector.x) % this.renderer.width;
    vector.y = (this.renderer.height + vector.y) % this.renderer.height;

    return vector;
  }

  resolveTic() {
    const newPositions = this.#getCurrentWritableBuffer();
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      const position = this.getEntityPositionByIndex(entityIndex);
      const velocityVector = this.getNewVelocity(position, entityIndex).limit(
        3
      );
      const newPosition = this.wrap(Vector.add(position, velocityVector));

      newPositions[entityIndex] = [newPosition, velocityVector];
    }
    this.#swapBuffers();
  }

  render() {
    this.renderer.clear();
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      const entity = this.entities[entityIndex];
      const position = this.getEntityPositionByIndex(entityIndex);

      this.renderer.drawCircle(
        position.x,
        position.y,
        this.particleSize,
        this.getColorByEntityType(entity.type)
      );
    }
  }
}
