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

  area;

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
    this.area = Math.PI * this.particleSize * this.particleSize * 0.01; // m^2
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

  // getMagnitudeByDistance(distance) {
  //   if (distance < 0) {
  //     return 0;
  //   }

  //   return 1 / (distance + 0.05);
  // }

  getMagnitudeByDistance(distance) {
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
    return this.attractionMods[this.entities[idA].type][
      this.entities[idB].type
    ];
  }

  getEntityPositionByIndex(entityIndex) {
    return this.entityPositions[entityIndex][0];
  }

  getEntityVelocityByIndex(entityIndex) {
    return this.entityPositions[entityIndex][1];
  }

  isTooFarAway(v1, v2) {
    if (
      ((this.renderer.width + v1.x + 50) % this.renderer.width >= v2.x || // other is too far right of us
        (this.renderer.width + v1.x - 50) % this.renderer.width <= v2.x) && // other is too far left of us
      ((this.renderer.height + v1.y + 50) % this.renderer.height >= v2.y || // other is too far below us
        (this.renderer.height + v1.y - 50) % this.renderer.height <= v2.y) // other is too far above us
    ) {
      return false;
    }

    // These are too far away it seems.
    return true;
  }

  getForceVectors(position, skipIndex) {
    const totalForceVector = new Vector(0, 0);
    // const collisionForceVector = new Vector(0, 0);

    // for (let i = this.entityPositions.length; i > 0; i -= 1) {
    this.entityPositions.forEach(([otherPos, vel], entityIndex) => {
      if (entityIndex === skipIndex) {
        return;
      }

      // if (this.isTooFarAway(position, otherPos)) {
      //   return;
      // }

      const force = Vector.getShortestTorusDeltaVector(
        position,
        otherPos,
        this.renderer.width,
        this.renderer.height
      );

      let magnitude = this.getMagnitudeByDistance(
        force.length() - this.particleSize
      );
      if (magnitude > 0) {
        magnitude *= this.getAttractionModifier(skipIndex, entityIndex);
      }

      // Store the direction of this collision force;
      force.scale(magnitude);

      totalForceVector.add(force);
    }, this);

    // return [totalForceVector.normalise().scale(0.5), collisionForceVector];
    return totalForceVector.normalise().scale(0.5);
  }

  wrap(vector) {
    vector.x = (this.renderer.width + vector.x) % this.renderer.width;
    vector.y = (this.renderer.height + vector.y) % this.renderer.height;

    return vector;
  }

  addDragForce(velocityVector) {
    const dragX =
      -0.5 *
      this.area *
      velocityVector.x *
      velocityVector.x *
      (velocityVector.x / Math.abs(velocityVector.x));
    const dragY =
      -0.5 *
      this.area *
      velocityVector.y *
      velocityVector.y *
      (velocityVector.y / Math.abs(velocityVector.y));

    velocityVector.x += isNaN(dragX) ? 0 : dragX;
    velocityVector.y += isNaN(dragY) ? 0 : dragY;
  }

  calcNewVelocityVector(position, entityIndex) {
    const currentVelocityVector = this.getEntityVelocityByIndex(entityIndex);
    const forceVectors = this.getForceVectors(position, entityIndex);

    // Add force vectors
    currentVelocityVector.add(forceVectors);

    // apply drag forces

    this.addDragForce(currentVelocityVector);

    return currentVelocityVector;
  }

  resolveTic(msSinceLastTic) {
    const newPositions = this.#getCurrentWritableBuffer();
    for (let i = this.entityPositions.length; i > 0; i -= 1) {
      const entityIndex = i - 1;
      const position = this.getEntityPositionByIndex(entityIndex);
      const velocityVector = this.calcNewVelocityVector(position, entityIndex);
      const newPosition = this.wrap(position.add(velocityVector));

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
