import { calculateTimeDifferenceInMinutes } from "@/lib/dates";

describe("calculateTimeDifferenceInMinutes", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2022-01-01T00:05:00").getTime());
  });

  it("should return the correct difference in minutes", () => {
    const date = new Date("2022-01-01T00:00:00");
    expect(calculateTimeDifferenceInMinutes(date)).toBe(5);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
