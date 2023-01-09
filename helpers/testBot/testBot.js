import { Utils } from "../../utils.js";

class DivResultsRenderer {
  container;

  suiteElements = [];

  constructor(container) {
    this.container = container;
  }

  getSuiteElement(name) {
    let suiteElement = this.suiteElements[name];

    if (Utils.isUndefined(suiteElement)) {
      const suiteDivElement = document.createElement("div");
      const suiteTitleElement = document.createElement("h2");
      suiteElement = document.createElement("ul");

      suiteTitleElement.innerText = name;
      suiteDivElement.append(suiteTitleElement, suiteElement);
      this.container.appendChild(suiteDivElement);

      this.suiteElements[name] = suiteElement;
    }

    return suiteElement;
  }

  addResult(suiteName, testName, result, expected, actual) {
    const suiteElement = this.getSuiteElement(suiteName);
    const resultLine = document.createElement("li");

    let outcome = document.createElement("span");
    if (result === TestBot.TEST_SUCCEEDED) {
      outcome.style.color = "lime";
      outcome.innerText = "√";
    } else if (result === TestBot.TEST_FAILED) {
      outcome.style.color = "red";
      outcome.innerText = "X";
    } else if (result === TestBot.TEST_ERROR) {
      outcome.style.color = "orange";
      outcome.innerText = "E";
    } else if (result === TestBot.TEST_MISSING) {
      outcome.style.color = "yellow";
      outcome.innerText = "MISSING ASSERT";
    } else {
      outcome.style.color = "gray";
      outcome.innerText = "UNKNOWN RESULT";
    }

    resultLine.append(outcome, " - ", testName);

    suiteElement.appendChild(resultLine);
  }
}

class Suite {
  name;

  tests = [];

  constructor(suiteName) {
    this.name = suiteName;
  }

  addTest(testName, testMethod) {
    this.tests.push({
      name: testName,
      fnTest: testMethod,
    });
  }
}

export class TestBot {
  static TEST_SUCCEEDED = 0;
  static TEST_FAILED = 1;
  static TEST_ERROR = 2;
  static TEST_MISSING = 3;

  testSuites = [];

  expected;

  expectedError;

  actual;

  result;

  constructor(resultRenderer) {
    this.resultRenderer = resultRenderer;
  }

  static renderResultsInDiv(container) {
    return new DivResultsRenderer(container);
  }

  createSuite(testSuiteName) {
    const newSuite = new Suite(testSuiteName);
    this.testSuites.push(newSuite);

    return newSuite;
  }

  runSuite(suite) {
    const tests = suite.tests;
    tests.forEach((test) => {
      this.expected = undefined;
      this.actual = undefined;
      this.expectedError = undefined;
      this.result = TestBot.TEST_MISSING;

      try {
        test.fnTest();
      } catch (error) {
        if (Utils.isDefined(this.expectedError)) {
          if (this.expectedError == error.__proto__.name) {
            this.result = TestBot.TEST_SUCCEEDED;
          } else {
            this.result = TestBot.TEST_FAILED;
          }
        } else {
          this.result = TestBot.TEST_ERROR;
        }
      }

      this.resultRenderer.addResult(
        suite.name,
        test.name,
        this.result,
        this.expected,
        this.actual
      );
    });
  }

  run() {
    this.testSuites.forEach((suite) => {
      this.runSuite(suite);
    });
  }

  assertStrictlyEquals(expected, actual) {
    this.expected = expected;
    this.actual = actual;
    this.result =
      expected === actual ? TestBot.TEST_SUCCEEDED : TestBot.TEST_FAILED;
  }

  assertThrowsExpectedError(expectedError) {
    this.expectedError = expectedError.prototype.name;
  }

  assertDeepCompareObjects(expected, actual) {
    this.expected = expected;
    this.actual = actual;
    this.result = Utils.objectEquals(expected, actual)
      ? TestBot.TEST_SUCCEEDED
      : TestBot.TEST_FAILED;
  }
}
