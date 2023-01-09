import { TestBot } from "./helpers/testBot/testBot.js";
// import { Utils } from "../utils.js";

const resultsContainer = document.createElement('div');
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);

const testRunner = new TestBot(resultRenderer);

const assertEqualsTest = testRunner.createSuite("Tests assertStrictlyEquals");
assertEqualsTest.addTest("Test assert strictly equals succeeding shows green", () => {
  const expected = "foo";
  const actual = "foo";

  testRunner.assertStrictlyEquals(expected, actual);
});

testRunner.run();