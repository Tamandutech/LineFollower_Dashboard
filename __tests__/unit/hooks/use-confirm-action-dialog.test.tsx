import {
  type UseConfirmActionModalReturn,
  useConfirmActionModal,
} from "@/hooks/use-confirm-action-modal";
import {
  type RenderHookResult,
  act,
  renderHook,
} from "@testing-library/react-native";

describe("useConfirmActionDialog", () => {
  let renderHookResult: RenderHookResult<UseConfirmActionModalReturn, unknown>;
  const state = {
    header: "Confirmar teste",
    content: "Deseja testar o modal?",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    renderHookResult = renderHook(useConfirmActionModal);
  });

  it("should set the state when the modal is revealed", async () => {
    await act(() => renderHookResult?.result.current.reveal(state));

    expect(renderHookResult?.result.current.state?.header).toEqual(
      "Confirmar teste",
    );
    expect(renderHookResult?.result.current.state?.content).toEqual(
      "Deseja testar o modal?",
    );
  });

  it("should call onConfirm and close the modal when the confirm callback is called", async () => {
    await act(() => renderHookResult?.result.current.reveal(state));

    await act(() => renderHookResult?.result.current.state?.onConfirm());

    expect(state.onConfirm).toHaveBeenCalled();
    expect(renderHookResult?.result.current.state).toBeNull();
  });

  it("should call onCancel and close the modal when the cancel callback is called", async () => {
    await act(() => renderHookResult?.result.current.reveal(state));

    await act(() => renderHookResult?.result.current.state?.onCancel?.());

    expect(state.onCancel).toHaveBeenCalled();
    expect(renderHookResult?.result.current.state).toBeNull();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
