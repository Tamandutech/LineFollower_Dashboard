import data from "@/middlewares/data";

describe("data", () => {
  it("should extract the data from the response of a robot", () => {
    const response = { data: "data" };
    const useSWRNext = jest.fn(() => ({
      data: response,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
      isLoading: false,
    }));
    const result = data(useSWRNext)("key", async () => response, {});
    expect(result.data).toBe("data");
  });
});
