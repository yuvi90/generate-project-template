import { describe, expect, test } from "@jest/globals";

/*  
    Simple Testing Example
*/

import { add } from "../sample";

describe("Testing add function", () => {
  test("adds 1 + 2 to equal 3", () => {
    expect(add(1, 2)).toBe(3);
  });
});

/*  
    Complex Testing Example
*/

// requestActual ensures you get the real file instead of an automock
// also use import type and <typeof ...> to get types
import type * as TestFunctions from "../sample";
const { subtract } = jest.requireActual<typeof TestFunctions>("../sample.ts");

const successCases = [
  {
    id: 0,
    input: { a: 1, b: 1 },
    output: 0,
  },
  {
    id: 1,
    input: { a: 5, b: 0 },
    output: 5,
  },
  {
    id: 2,
    input: { a: 5, b: 2 },
    output: 3,
  },
  {
    id: 3,
    input: { a: 4, b: 5 },
    output: -1,
  },
];

describe("Testing subtract function", () => {
  it.each(successCases)(`success case`, ({ input, output }) => {
    const { a, b } = input;
    expect(subtract(a, b)).toBe(output);
  });
});
