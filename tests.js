import { TestBot } from "./helpers/testBot/testBot.js";
import { World } from "./actors/World/world.js";
import { Entity } from "./actors/Entity/entity.js";
import { Utils } from "./utils.js";
import { DuplicateEntityIdError } from "./actors/World/duplicateEntityIdError.js";
import { MalformedIdParameterError } from "./actors/Entity/malformedIdParameterError.js";
import { MissingParameterError } from "./errors/missingParameterError.js";
import { MalformedTypeParameterError } from "./actors/Entity/malformedTypeParameterError.js";
import { Vector } from "./actors/vector.js";

const resultsContainer = document.createElement("div");
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);

const testRunner = new TestBot(resultRenderer);

function getMockRenderer() {
  return {
    width: 100,
    height: 60,
    halfWidth: 50,
    halfHeight: 30,
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
    const position = new Vector(0, 0);

    world.addEntityAt(entityOne, position);
    world.addEntityAt(entityTwo, position);
    world.addEntityAt(duplicateIdEntity, position);
  }
);

testsWorld.addTest(
  "World calls renderer to draw single provided entity",
  () => {
    const expected = [5, 5, 5, "red"];

    let actual;
    const mockRenderer = getMockRenderer();
    mockRenderer.drawCircle = (x, y, r, color) => {
      actual = [x, y, r, color];
    };
    const config = { particleSize: 5 };

    const world = new World(mockRenderer, config);
    const entity = new Entity(1, Entity.TYPE_ZERO);
    const position = new Vector(5, 5);

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

testsWorld.addTest(
  "isTooFarAway returns true with v1 and v2 dispersed in the centre",
  () => {
    const mockRenderer = getMockRenderer();
    mockRenderer.width = 600;
    mockRenderer.height = 400;
    const world = new World(mockRenderer);
    const expected = true;
    const v1 = new Vector(27, 200);
    const v2 = new Vector(210, 390);
    const actual = world.isTooFarAway(v1, v2);

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

testsWorld.addTest(
  "isTooFarAway returns true with v1 and v2 close in height but not width",
  () => {
    const mockRenderer = getMockRenderer();
    mockRenderer.width = 600;
    mockRenderer.height = 400;
    const world = new World(mockRenderer);
    const expected = true;
    const v1 = new Vector(27, 10);
    const v2 = new Vector(210, 390);
    const actual = world.isTooFarAway(v1, v2);

    testRunner.assertStrictlyEquals(expected, actual);
  }
);
testsWorld.addTest(
  "isTooFarAway returns false with v1 and v2 close in the centre",
  () => {
    const mockRenderer = getMockRenderer();
    mockRenderer.width = 600;
    mockRenderer.height = 400;
    const world = new World(mockRenderer);
    const expected = false;
    const v1 = new Vector(310, 200);
    const v2 = new Vector(300, 210);
    const actual = world.isTooFarAway(v1, v2);

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

testsWorld.addTest(
  "isTooFarAway returns false with v1 at the top centre and v2 at the bottom centre",
  () => {
    const mockRenderer = getMockRenderer();
    mockRenderer.width = 600;
    mockRenderer.height = 400;
    const world = new World(mockRenderer);
    const expected = false;
    const v1 = new Vector(mockRenderer.width * 0.5, 10);
    const v2 = new Vector(mockRenderer.width * 0.5, mockRenderer.height - 10);
    const actual = world.isTooFarAway(v1, v2);

    testRunner.assertStrictlyEquals(expected, actual);
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

/**
 * Vector Class tests
 */
const testsVector = testRunner.createSuite("Tests Vector class");

testsVector.addTest("v(1,1) + v(1,1) = v(2,2)", () => {
  const expected = new Vector(2, 2);
  const v1 = new Vector(1, 1);
  const v2 = new Vector(1, 1);
  const actual = Vector.add(v1, v2);

  testRunner.assertDeepCompareObjects(expected, actual);
});

testsVector.addTest("v(2,3) + v(-2,-3) = v(0,0)", () => {
  const expected = new Vector(0, 0);
  const v1 = new Vector(2, 3);
  const v2 = new Vector(-2, -3);
  const actual = Vector.add(v1, v2);

  testRunner.assertDeepCompareObjects(expected, actual);
});

testsVector.addTest("v(2,1) + v(2,-2) + v(-1,1) + v(-4,-1) = v(-1,-1)", () => {
  const expected = new Vector(-1, -1);
  const v1 = new Vector(2, 1);
  const v2 = new Vector(2, -2);
  const v3 = new Vector(-1, 1);
  const v4 = new Vector(-4, -1);
  const actual = Vector.add(Vector.add(v1, v2), Vector.add(v3, v4));

  testRunner.assertDeepCompareObjects(expected, actual);
});

testsVector.addTest(
  "calc distance between v(10, 0) and v(20, 0) on width 100 returns 10",
  () => {
    const expected = 10;
    const v1 = new Vector(10, 0);
    const v2 = new Vector(20, 0);
    const actual = Vector.getShortestTorusDeltaVector(v1, v2, 100, 60).length();

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

testsVector.addTest(
  "calc distance between v(10, 0) and v(70, 0) on width 100 returns 40",
  () => {
    const expected = 40;
    const v1 = new Vector(10, 0);
    const v2 = new Vector(70, 0);
    const actual = Vector.getShortestTorusDeltaVector(v1, v2, 100, 60).length();

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

testRunner.run();
