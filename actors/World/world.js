import { DuplicateEntityIdError } from "./duplicateEntityIdError.js";
import { Utils } from "../../utils.js";
import { MissingParameterError } from "../../errors/missingParameterError.js";
import { Vector2d } from "../vector2d.js";
import { Entity } from "../Entity/entity.js";

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
    writablePositionBuffer[entityIndex] = position;
  }

  getEntityPosition(entity) {
    const entityIndex = this.entityMap[entity.id];

    return this.entityPositions[entityIndex];
  }

  getModifierByDistance(distance) {
    const massMod = 0.00001;
    const linearMod = 0.05;

    if (distance < 0.0000001) {
      return -linearMod;
    }

    // if (distance > 0.1) {
    //   return 0;
    // }

    const linearVal = 4 * distance - linearMod;
    const massVal = massMod / (distance * distance);

    let modifier = Math.min(linearVal, massVal);

    return modifier;
  }

  // getModifierByDistance(distance) {
  //   const attractionMod = 1;

  //   if (distance < 0.05) {
  //     return distance - 0.05;
  //   }

  //   if (distance < 0.0703) {
  //     return distance - 0.1 * attractionMod;
  //   }

  //   return (0.0001 / (distance * distance)) * attractionMod;
  // }

  getAttractionModifier(idA, idB) {
    const entityA = this.entities[idA];
    const entityB = this.entities[idB];
    const typeA = entityA.type;
    const typeB = entityB.type;

    return this.attractionMods[typeA][typeB];
  }

  calcNewPosition(position, skipIndex) {
    let newPosition = position;
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      if (entityIndex === skipIndex) {
        continue;
      }
      if (newPosition.x > 1) {
        newPosition.x -= 2;
      } else if (newPosition.x < -1) {
        newPosition.x += 2;
      }

      if (newPosition.y > 1) {
        newPosition.y -= 2;
      } else if (newPosition.y < -1) {
        newPosition.y += 2;
      }

      const otherPos = this.entityPositions[entityIndex];
      const distance = Vector2d.distance(newPosition, otherPos);
      const diffAtoB = Vector2d.subtract(newPosition, otherPos);
      let modifier = this.getModifierByDistance(distance);
      const attractionMod = this.getAttractionModifier(skipIndex, entityIndex);
      if (modifier > 0) {
        modifier *= attractionMod;
      }
      diffAtoB.scale(modifier);
      newPosition = Vector2d.subtract(newPosition, diffAtoB);
    }

    return newPosition;
  }

  resolveTic() {
    // update new position buffer with current position data
    const newPositions = this.#getCurrentWritableBuffer();
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      const entity = this.entities[entityIndex];
      const position = this.entityPositions[entityIndex];
      const newPosition = this.calcNewPosition(position, entityIndex);

      newPositions[entityIndex] = newPosition;
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
