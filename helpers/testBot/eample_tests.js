import { TestBot } from "./testBot.js";

const resultsContainer = document.createElement("div");
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);

const testRunner = new TestBot(resultRenderer);

/**
 * Strictly equals assertion tests
 */
const assertEqualsTest = testRunner.createSuite("Tests assertStrictlyEquals");

assertEqualsTest.addTest(
  "Test assert strictly equals succeeding shows green",
  () => {
    const expected = "foo";
    const actual = "foo";

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

assertEqualsTest.addTest(
  "Test assert strictly equals failing shows red",
  () => {
    const expected = "foo";
    const actual = "bar";

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

assertEqualsTest.addTest(
  "Test assert strictly equals encounters error shows orange",
  () => {
    throw new Error("This should cause an error and show orange in TestBot.");
  }
);

/**
 * Object deep compare assertion tests
 */
const assertObjectDeepCompareTest = testRunner.createSuite(
  "Tests assertDeepCompareObjects"
);

assertObjectDeepCompareTest.addTest(
  "Test assert deep compare of same objects shows green",
  () => {
    const expected = {
      name: "deep compared object 1",
      id: 1,
      values: ["a", "b", "c"],
    };
    const actual = {
      id: 1,
      name: "deep compared object 1",
      values: ["a", "b", "c"],
    };

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

assertObjectDeepCompareTest.addTest(
  "Test assert deep compare of different objects shows red",
  () => {
    const expected = {
      name: "deep compared object 2",
      id: 2,
      values: ["a", "b", "c"],
    };
    const actual = {
      name: "deep compared object 2",
      id: 2,
      values: [1, 2, 3],
    };

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

assertObjectDeepCompareTest.addTest(
  "Test assert deep compare encounters error shows orange",
  () => {
    throw new Error("This should cause an error and show orange in TestBot.");
  }
);

/**
 * Throws expected error assertion tests
 */
const testsAssertError = testRunner.createSuite(
  "Tests assertThrowsExpectedError"
);

testsAssertError.addTest(
  "Test assert expected error thrown shows green",
  () => {
    testRunner.assertThrowsExpectedError(TypeError);

    throw new TypeError("This error should be expected and show up green.");
  }
);

testsAssertError.addTest(
  "Test assert unexpected error thrown shows red",
  () => {
    testRunner.assertThrowsExpectedError(RangeError);

    throw new TypeError("This error should not be expected and show up red.");
  }
);

/**
 * Less than assertion tests
 */
const assertLessThanTests = testRunner.createSuite("Tests assertLessThan");

assertLessThanTests.addTest("assert left less than right shows green", () => {
  testRunner.assertLessThan(1, 2);
});

assertLessThanTests.addTest("assert left greater than right shows red", () => {
  testRunner.assertLessThan(2, 1);
});

assertLessThanTests.addTest("assert left equals right shows red", () => {
  testRunner.assertLessThan(2, 2);
});

testRunner.run();
