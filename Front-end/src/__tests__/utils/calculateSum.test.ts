function calculateSum(a: number, b: number): number {
  return a + b;
}

describe("calculateSum", () => {
  it("should return the sum of two positive numbers", () => {
    expect(calculateSum(2, 3)).toBe(5);
  });

  it("should return the sum of two negative numbers", () => {
    expect(calculateSum(-4, -6)).toBe(-10);
  });

  it("should return the correct sum when one number is zero", () => {
    expect(calculateSum(0, 7)).toBe(7);
    expect(calculateSum(5, 0)).toBe(5);
  });

  it("should return the correct sum for mixed positive and negative numbers", () => {
    expect(calculateSum(-3, 8)).toBe(5);
    expect(calculateSum(10, -15)).toBe(-5);
  });

  it("should handle large numbers correctly", () => {
    expect(calculateSum(1000000, 2000000)).toBe(3000000);
  });
});
