import { BaseError } from "@/errors";
import {
  type UseErrorModalReturn,
  useErrorModal,
} from "@/hooks/use-error-modal";
import {
  type RenderHookResult,
  renderHook,
} from "@testing-library/react-native";

describe("useErrorModal", () => {
  let renderHookResult: RenderHookResult<UseErrorModalReturn, unknown>;

  describe("without error", () => {
    beforeEach(() => {
      renderHookResult = renderHook(() => useErrorModal(null));
    });

    it("should return null when error is null", () => {
      expect(renderHookResult.result.current).toBeNull();
    });
  });

  describe("with error", () => {
    beforeEach(() => {
      renderHookResult = renderHook(() =>
        useErrorModal(
          new BaseError({
            message: "Test error",
            action: "Test action",
          }),
        ),
      );
    });

    it("should return an error modal when error is not null", () => {
      expect(renderHookResult.result.current).not.toBeNull();
    });
  });
});
