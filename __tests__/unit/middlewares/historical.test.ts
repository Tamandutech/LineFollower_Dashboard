import historical from "@/middlewares/historical";
import {
  type RenderHookResult,
  renderHook,
} from "@testing-library/react-native";
import type { SWRResponse } from "swr";

describe("historical", () => {
  it("should keep a history of the data obtained by a SWRHook", () => {
    const response = "test";
    const useSWRNext = jest.fn(() => ({
      data: response,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
      isLoading: false,
    }));
    const { result } = renderHook(() =>
      historical(useSWRNext)("key", async () => response, {}),
    ) as RenderHookResult<
      SWRResponse<string, unknown> & { history: string[] },
      unknown
    >;
    expect(result.current.history as string[]).toEqual([response]);
  });
});
