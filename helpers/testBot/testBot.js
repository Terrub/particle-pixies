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

  printOutcome(suiteName, testName, color, chevron) {
    const suiteElement = this.getSuiteElement(suiteName);
    const resultLine = document.createElement("li");

    const outcome = document.createElement("span");
    outcome.style.color = color;
    outcome.innerText = chevron;

    resultLine.append(outcome, " - ", testName);
    suiteElement.appendChild(resultLine);
  }

  addSuccessResult(suiteName, testName) {
    this.printOutcome(suiteName, testName, "lime", "√");
  }

  addFailedResult(suiteName, testName, expected, actual) {
    this.printOutcome(suiteName, testName, "red", "X");
    console.log(testName);
    console.log("> Expected:", expected);
    console.log("> Actual:", actual);
  }

  addErrorResult(suiteName, testName, expected, error) {
    this.printOutcome(suiteName, testName, "orange", "E");
    console.log(testName);
    console.log("> Expected:", expected);
    console.log("> Actual:", error);
  }

  addMissingResult(suiteName, testName) {
    this.printOutcome(suiteName, testName, "yellow", "MISSING ASSERT");
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
      let caughtError;
      let caughtErrorName;

      try {
        test.fnTest();
      } catch (error) {
        caughtError = error;
        caughtErrorName = error.name;

        if (Utils.isDefined(this.expectedError)) {
          if (this.expectedError === caughtErrorName) {
            this.result = TestBot.TEST_SUCCEEDED;
          } else {
            this.result = TestBot.TEST_FAILED;
            this.expected = this.expectedError;
            this.actual = caughtError;
          }
        } else {
          this.result = TestBot.TEST_ERROR;
        }
      }

      // We seem to expect an error but received none?? Fault it
      if (
        Utils.isDefined(this.expectedError) &&
        this.result === TestBot.TEST_MISSING
      ) {
        this.result = TestBot.TEST_FAILED;
        this.expected = this.expectedError;
        this.actual = caughtError;
      }

      if (this.result === TestBot.TEST_SUCCEEDED) {
        this.resultRenderer.addSuccessResult(suite.name, test.name);
      } else if (this.result === TestBot.TEST_FAILED) {
        this.resultRenderer.addFailedResult(
          suite.name,
          test.name,
          this.expected,
          this.actual
        );
      } else if (this.result === TestBot.TEST_ERROR) {
        this.resultRenderer.addErrorResult(
          suite.name,
          test.name,
          this.expected,
          caughtError
        );
      } else {
        this.resultRenderer.addMissingResult(suite.name, test.name);
      }
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
    this.expectedError = expectedError.name;
  }

  assertDeepCompareObjects(expected, actual) {
    this.expected = expected;
    this.actual = actual;
    this.result = Utils.objectEquals(expected, actual)
      ? TestBot.TEST_SUCCEEDED
      : TestBot.TEST_FAILED;
  }

  assertLessThan(left, right) {
    this.expected = true;
    this.actual = left < right;
    this.result =
      this.expected === this.actual
        ? TestBot.TEST_SUCCEEDED
        : TestBot.TEST_FAILED;
  }
}
