import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

describe("formatting utils", () => {
  it("formats currency with symbol and 2 decimals", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatCurrency(1000, "EUR")).toContain("1,000");
  });

  it("formats compact currency", () => {
    expect(formatCompactCurrency(1_200_000)).toBe("$1.2M");
    expect(formatCompactCurrency(850_000)).toBe("$850K");
  });

  it("formats numbers with thousands separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("formats percentages to one decimal", () => {
    expect(formatPercent(81.666)).toBe("81.7%");
    expect(formatPercent(100)).toBe("100.0%");
  });
});
