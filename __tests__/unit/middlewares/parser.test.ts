import parser from "@/middlewares/parser";

describe("parser", () => {
  it("should parse the fetched data using the function passed as argument", () => {
    const response = [1, 2, 3];
    const fn = jest.fn((array: number[]) => array.map((value) => value * 2));
    const useSWRNext = jest.fn(() => ({
      data: response,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
      isLoading: false,
    }));

    const result = parser(fn)(useSWRNext)("key", async () => response, {});

    expect(fn).toHaveBeenCalledWith(response);
    expect(result.data).toEqual([2, 4, 6]);
  });
});
