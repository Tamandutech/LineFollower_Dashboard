import ConfirmActionModal from "@/components/ui/confirm-action-modal";
import { fireEvent, render, screen } from "@testing-library/react-native";

describe("ConfirmActionModal", () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    render(
      <ConfirmActionModal
        header={"Confirmar teste"}
        content="Deseja testar o modal?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        onClose={onClose}
        isOpen={true}
      />,
    );
  });

  it("should render the title and description", () => {
    expect(screen.findByText("Confirmar teste")).resolves.toBeTruthy();
    expect(screen.findByText("Deseja testar o modal?")).resolves.toBeTruthy();
  });

  it.skip("should call onConfirm and close the modal when the confirm button is clicked", async () => {
    fireEvent.press(await screen.findByText("OK"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it.skip("should call onCancel and close the modal when the cancel button is clicked", async () => {
    fireEvent.press(await screen.findByText("Cancelar"));
    expect(onCancel).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
