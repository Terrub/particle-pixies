import { TestBot } from "./helpers/testBot/testBot.js";
import { World } from "./actors/World/world.js";
import { Entity } from "./actors/Entity/entity.js";
import { Utils } from "./utils.js";
import { DuplicateEntityIdError } from "./actors/World/duplicateEntityIdError.js";
import { MalformedIdParameterError } from "./actors/Entity/malformedIdParameterError.js";
import { MissingParameterError } from "./errors/missingParameterError.js";
import { Vector2d } from "./actors/vector2d.js";
import { MalformedTypeParameterError } from "./actors/Entity/malformedTypeParameterError.js";

const resultsContainer = document.createElement("div");
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);

const testRunner = new TestBot(resultRenderer);

function getMockRenderer() {
  return {
    drawCircle: () => {},
    clear: () => {},
  };
}

/**
 * World Class tests
 */
const testsWorld = testRunner.createSuite("Tests World class");

testsWorld.addTest(
  "Constructing world without renderer throws MissingParameterError",
  () => {
    testRunner.assertThrowsExpectedError(MissingParameterError);

    const world = new World();
  }
);

testsWorld.addTest(
  "Adding entity with duplicate id throws DuplicateEntityIdError",
  () => {
    testRunner.assertThrowsExpectedError(DuplicateEntityIdError);

    const mockRenderer = getMockRenderer();
    const world = new World(mockRenderer);
    const entityOne = new Entity(1, Entity.TYPE_ONE);
    const entityTwo = new Entity(2, Entity.TYPE_TWO);
    const duplicateIdEntity = new Entity(1, Entity.TYPE_ONE);
    const position = new Vector2d(0.0, 0.0);

    world.addEntityAt(entityOne, position);
    world.addEntityAt(entityTwo, position);
    world.addEntityAt(duplicateIdEntity, position);
  }
);

testsWorld.addTest(
  "World calls renderer to draw single provided entity",
  () => {
    const expected = [0.5, 0.5, 5, "red"];

    let actual;
    const mockRenderer = getMockRenderer();
    mockRenderer.drawCircle = (x, y, r, color) => {
      actual = [x, y, r, color];
    };
    const config = { particleSize: 5 };

    const world = new World(mockRenderer, config);
    const entity = new Entity(1, Entity.TYPE_ZERO);
    const position = new Vector2d(0.5, 0.5);

    world.addEntityAt(entity, position);
    world.resolveTic();
    world.render();

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

testsWorld.addTest("world particle size is configurable", () => {
  const mockRenderer = getMockRenderer();
  const defaultWorld = new World(mockRenderer);
  const config = { particleSize: 5 };
  const configuredWorld = new World(mockRenderer, config);

  const expected = {
    default: 3,
    configured: 5,
  };

  const actual = {
    default: defaultWorld.particleSize,
    configured: configuredWorld.particleSize,
  };

  testRunner.assertDeepCompareObjects(expected, actual);
});

/**
 * Entity Class tests
 */
const testsEntity = testRunner.createSuite("Tests Entity class");

testsEntity.addTest(
  "Constructing entity without id throws MalformedIdParameterError",
  () => {
    testRunner.assertThrowsExpectedError(MalformedIdParameterError);

    const faultyEntity = new Entity();
  }
);

testsEntity.addTest(
  "Constructing entity without type throws MalformedTypeParameterError",
  () => {
    testRunner.assertThrowsExpectedError(MalformedTypeParameterError);

    const faultyEntity = new Entity(1);
  }
);

testsEntity.addTest("New entity has a providable id", () => {
  const entity = new Entity(1, Entity.TYPE_FIVE);
  const expected = 1;
  const actual = entity.id;

  testRunner.assertStrictlyEquals(expected, actual);
});

testsEntity.addTest("New entity has a type", () => {
  const expected = true;
  const entity = new Entity(1, Entity.TYPE_FOUR);
  const actual = Utils.isDefined(entity.type);

  testRunner.assertStrictlyEquals(expected, actual);
});

testRunner.run();
