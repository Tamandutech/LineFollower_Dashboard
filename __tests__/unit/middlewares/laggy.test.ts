import laggy from "@/middlewares/laggy";
import { act, renderHook } from "@testing-library/react-native";
import { useState } from "react";

describe("laggy", () => {
  it("should keep the data when the key changes", async () => {
    const response = "test";
    const useSWRNext = jest.fn(() => ({
      data: response,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
      isLoading: false,
    }));
    const { result } = renderHook(() => {
      const [key, setKey] = useState("1");
      return {
        swr: laggy(useSWRNext)("key", async () => response, {}),
        key,
        setKey,
      };
    });
    await act(() => {
      result.current.setKey("2");
    });
    expect(result.current.swr.data).toBe(response);
  });
});
