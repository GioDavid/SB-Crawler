import { describe, expect, it } from "vitest";
import { countWords } from "./count-words.js";

describe("countWords", () => {
  it("counts normal words", () => {
    expect(countWords("This is a simple example")).toBe(5);
  });

  it("ignores standalone symbols", () => {
    expect(countWords("This is - a self-explained example")).toBe(5);
  });

  it("counts hyphenated text as one word", () => {
    expect(countWords("AI-powered software")).toBe(2);
  });

  it("ignores multiple standalone symbols", () => {
    expect(countWords("AI - & software")).toBe(2);
  });

  it("handles multiple spaces", () => {
    expect(countWords("one   two   three")).toBe(3);
  });

  it("returns zero for an empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns zero for only symbols", () => {
    expect(countWords("- & !")).toBe(0);
  });

  it("correctly identifies exactly five words", () => {
    expect(countWords("one two three four five")).toBe(5);
  });

  it("correctly identifies six words", () => {
    expect(countWords("one two three four five six")).toBe(6);
  });
});
