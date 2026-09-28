import { describe, expect, it } from "vitest";
import { TransactionValidationError, validateAmount, validateDate, validateMonth, validateType } from "./transaction-validation";

describe("transaction validation", () => {
  it("accepts supported values", () => {
    expect(validateType("income")).toBe("income");
    expect(validateAmount("1200.50")).toBe(1200.5);
    expect(validateDate("2026-09-28")).toBe("2026-09-28");
    expect(validateMonth("2026-09")).toEqual({ year: 2026, month: 9 });
  });

  it.each([
    () => validateType("transfer"),
    () => validateAmount(0),
    () => validateAmount(10.999),
    () => validateDate("2026-02-30"),
    () => validateMonth("2026-13"),
  ])("rejects invalid values", (validator) => expect(validator).toThrow(TransactionValidationError));
});