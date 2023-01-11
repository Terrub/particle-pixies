import { TestBot } from "./helpers/testBot/testBot.js";
import { World } from "./actors/World/world.js";
import { Entity } from "./actors/Entity/entity.js";
import { Utils } from "./utils.js";
import { DuplicateEntityIdError } from "./actors/World/duplicateEntityIdError.js";
import { MalformedIdParameterError } from "./actors/Entity/malformedIdParameterError.js";
import { MissingParameterError } from "./errors/missingParameterError.js";

const resultsContainer = document.createElement("div");
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);

const testRunner = new TestBot(resultRenderer);

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

    const mockRenderer = {};
    const world = new World(mockRenderer);
    const entityOne = new Entity(1);
    const entityTwo = new Entity(2);
    const duplicateIdEntity = new Entity(1);
    const position = { x: 0.0, y: 0.0 };

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
    const mockRenderer = {
      drawCircle: (x, y, r, color) => {
        actual = [x, y, r, color];
      },
    };

    const world = new World(mockRenderer);
    const entity = new Entity(1);
    const position = { x: 0.5, y: 0.5 };

    world.addEntityAt(entity, position);
    world.updateEntities(); // not sure I like this terminology

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

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

testsEntity.addTest("New entity has a providable id", () => {
  const entity = new Entity(1);
  const expected = 1;
  const actual = entity.id;

  testRunner.assertStrictlyEquals(expected, actual);
});

testsEntity.addTest("New entity has a type", () => {
  const expected = true;
  const entity = new Entity(1);
  const actual = Utils.isDefined(entity.type);

  testRunner.assertStrictlyEquals(expected, actual);
});

testRunner.run();
